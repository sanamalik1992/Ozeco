/**
 * import-from-production.ts
 *
 * One-shot import: OLD production Neon DB  →  new ozeco-v2 Neon DB.
 *
 * ┌──────────────────────────────── CRITICAL SAFETY CONSTRAINTS ────────────────────────────────┐
 * │ 1. OLD_DATABASE_URL is accessed READ-ONLY ONLY.                                             │
 * │ 2. All reads from OLD are wrapped in a single Postgres transaction with                     │
 * │    `readOnly: true` so the server rejects any non-SELECT. We also gate every                │
 * │    statement client-side via `assertSelectOnly()`.                                          │
 * │ 3. The script NEVER issues UPDATE / INSERT / DELETE / TRUNCATE / DROP / ALTER               │
 * │    against OLD_DATABASE_URL.                                                                │
 * │ 4. Connection strings are never logged. Only host-masked URIs appear in output.             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * Writes to DATABASE_URL (the new, empty project). IDs are preserved so FKs stay intact.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const OLD = process.env.OLD_DATABASE_URL;
const NEW = process.env.DATABASE_URL;
if (!OLD || !NEW) {
  console.error("OLD_DATABASE_URL and DATABASE_URL must both be set");
  process.exit(1);
}

const log = (msg: string) => console.log(msg);
const warn = (msg: string) => console.warn(msg);

function assertSelectOnly(q: string) {
  const trimmed = q.trim().replace(/^\s*\/\*[\s\S]*?\*\/\s*/g, "");
  if (!/^select\b/i.test(trimmed)) {
    throw new Error(
      `Refusing to run non-SELECT against OLD_DATABASE_URL: ${trimmed.slice(0, 60)}…`
    );
  }
}

type Row = Record<string, unknown>;
type NeonSqlFn = NeonQueryFunction<false, false> & ((q: string, params?: unknown[]) => Promise<Row[]>);

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!/503|cache|timeout|ETIMED|ECONN|reset/i.test(msg)) throw err;
      const delay = 500 * attempt * attempt;
      warn(`  [${label}] retry ${attempt}/6 in ${delay}ms — ${msg}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// Column lists per table.
// These mirror the NEW schema exactly — in_stock is NOT selected from OLD (dropped per Phase 1 decision).
const TABLE_ORDER = [
  {
    name: "users",
    cols: ["id", "username", "password"],
  },
  {
    // Note: old DB has no `in_the_box` column — it's new in v2 schema with an empty default.
    //       old DB has `in_stock`, which we intentionally drop per Phase 1 decision.
    name: "products",
    cols: [
      "id", "name", "brand", "slug", "description", "price", "original_price",
      "image", "images", "category", "stock_quantity", "is_bestseller",
      "motor_power", "battery_capacity", "max_range", "top_speed", "weight",
      "max_load", "frame_type", "rider_height", "features",
      "created_at",
    ],
  },
  {
    name: "product_variants",
    cols: ["id", "product_id", "name", "value", "price", "stock_quantity", "image", "created_at"],
  },
  {
    name: "reviews",
    cols: ["id", "product_id", "customer_name", "rating", "title", "comment", "verified", "created_at"],
  },
  {
    name: "customer_photos",
    cols: ["id", "product_id", "customer_name", "image_url", "caption", "approved", "created_at"],
  },
  {
    name: "blog_posts",
    cols: [
      "id", "slug", "title", "excerpt", "content", "author",
      "published_date", "category", "featured_image", "views", "created_at",
    ],
  },
  {
    name: "referral_codes",
    cols: ["id", "code", "referrer_email", "uses", "discount_amount", "created_at"],
  },
  {
    name: "newsletter_subscribers",
    cols: ["id", "email", "discount_code", "created_at"],
  },
  {
    name: "favorites",
    cols: ["id", "product_id", "session_id", "created_at"],
  },
  {
    name: "orders",
    cols: [
      "id", "session_id", "stripe_payment_intent_id", "paypal_order_id",
      "total_amount", "subtotal_amount", "discount_code", "discount_amount",
      "status", "fulfillment_status", "payment_method", "tracking_number",
      "courier_link", "customer_email", "customer_name",
      "shipping_address_line1", "shipping_address_line2", "shipping_city",
      "shipping_postal_code", "shipping_country", "customer_phone", "created_at",
    ],
  },
  {
    name: "cart_items",
    cols: ["id", "product_id", "variant_id", "quantity", "session_id", "created_at"],
  },
  {
    name: "order_items",
    cols: ["id", "order_id", "product_id", "variant_id", "quantity", "price_at_time", "created_at"],
  },
  {
    name: "visitor_sessions",
    cols: [
      "id", "session_id", "first_seen", "last_seen", "referrer", "user_agent",
      "traffic_source", "ip_address", "country", "city",
    ],
  },
  {
    name: "page_views",
    cols: ["id", "session_id", "path", "product_id", "timestamp"],
  },
  {
    name: "analytics_events",
    cols: ["id", "session_id", "event_type", "product_id", "order_id", "timestamp"],
  },
] as const;

async function readAllFromOld(oldSql: NeonSqlFn): Promise<Map<string, Row[]>> {
  log("── Reading from OLD production DB (READ-ONLY transaction) ──");
  const data = new Map<string, Row[]>();

  // Issue all SELECTs as a single atomic READ-ONLY transaction.
  // Neon HTTP supports sql.transaction(queries[], { readOnly: true, isolationLevel }).
  const queries: ReturnType<NeonSqlFn>[] = [];
  const queryStrings: string[] = [];

  for (const t of TABLE_ORDER) {
    const q = `SELECT ${t.cols.join(", ")} FROM ${t.name}`;
    assertSelectOnly(q);
    queryStrings.push(q);
    queries.push(oldSql(q) as unknown as ReturnType<NeonSqlFn>);
  }

  const results = (await withRetry("OLD read txn", () =>
    (oldSql as unknown as {
      transaction: (
        qs: unknown[],
        opts: { readOnly: true; isolationLevel: "Serializable" | "RepeatableRead" | "ReadCommitted" }
      ) => Promise<Row[][]>;
    }).transaction(queries, { readOnly: true, isolationLevel: "RepeatableRead" })
  )) as Row[][];

  TABLE_ORDER.forEach((t, i) => {
    const rows = results[i] ?? [];
    data.set(t.name, rows);
    log(`  ${t.name}: ${rows.length} rows`);
  });

  return data;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function bulkInsert(
  newSql: NeonSqlFn,
  table: string,
  cols: readonly string[],
  rows: Row[]
) {
  if (rows.length === 0) return 0;
  let inserted = 0;
  const CHUNK = 250;
  for (const batch of chunk(rows, CHUNK)) {
    const placeholders = batch
      .map((_, i) => `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(",")})`)
      .join(",");
    const params: unknown[] = [];
    for (const row of batch) {
      for (const c of cols) params.push(row[c] as unknown);
    }
    const q = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(",")}) VALUES ${placeholders}`;
    await withRetry(`insert ${table}`, () => newSql(q, params));
    inserted += batch.length;
  }
  return inserted;
}

async function writeAllToNew(newSql: NeonSqlFn, data: Map<string, Row[]>) {
  log("\n── Writing to NEW ozeco-v2 DB ──");
  for (const t of TABLE_ORDER) {
    const rows = data.get(t.name) ?? [];
    const n = await bulkInsert(newSql, t.name, t.cols, rows);
    log(`  ${t.name}: inserted ${n}/${rows.length}`);
  }
}

async function countTables(newSql: NeonSqlFn): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of TABLE_ORDER) {
    const rows = (await withRetry(`count ${t.name}`, () =>
      newSql(`SELECT COUNT(*)::int AS c FROM "${t.name}"`)
    )) as Array<{ c: number }>;
    out[t.name] = Number(rows[0]?.c ?? 0);
  }
  return out;
}

function expectedCountsReport(counts: Record<string, number>) {
  const EXPECT: Record<string, number> = {
    products: 18,
    product_variants: 31,
    reviews: 2353,
    customer_photos: 48,
    blog_posts: 7,
    orders: 2,
  };
  const rows: { table: string; count: number; expected: string; ok: string }[] = [];
  let allOk = true;
  for (const t of TABLE_ORDER) {
    const expected = EXPECT[t.name];
    const ok = expected === undefined ? "—" : counts[t.name] === expected ? "✓" : "✗";
    if (ok === "✗") allOk = false;
    rows.push({
      table: t.name,
      count: counts[t.name],
      expected: expected === undefined ? "" : String(expected),
      ok,
    });
  }
  log("\n── Row counts in NEW DB ──");
  log("table                     count   expected  ok");
  log("─".repeat(50));
  for (const r of rows) {
    log(
      `${r.table.padEnd(25)} ${String(r.count).padStart(5)}   ${String(r.expected).padStart(8)}   ${r.ok}`
    );
  }
  return allOk;
}

async function main() {
  const oldSql = neon(OLD!) as unknown as NeonSqlFn;
  const newSql = neon(NEW!) as unknown as NeonSqlFn;

  // Safety check: empty destination.
  const existing = (await withRetry("precheck", () =>
    newSql(`SELECT COUNT(*)::int AS c FROM products`)
  )) as Array<{ c: number }>;
  if ((existing[0]?.c ?? 0) > 0) {
    console.error(
      "Refusing to run — target DB already has rows in 'products'. " +
        "Drop/truncate manually if you really want to re-seed."
    );
    process.exit(2);
  }

  const data = await readAllFromOld(oldSql);
  await writeAllToNew(newSql, data);
  const counts = await countTables(newSql);
  const ok = expectedCountsReport(counts);
  if (!ok) {
    console.error("\n✗ Row counts do not match expected. Stop and investigate.");
    process.exit(3);
  }
  log("\n✓ All expected row counts matched.");
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  // Strip any accidental inclusion of a connection URL from the error message.
  const safe = msg.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgres://***");
  console.error(safe);
  process.exit(1);
});
