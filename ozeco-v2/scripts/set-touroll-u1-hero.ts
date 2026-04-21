/**
 * set-touroll-u1-hero.ts
 *
 * One-shot, idempotent update: promote the Touroll U1 to the hero slot.
 *  - stock_quantity = 10
 *  - is_bestseller  = true
 *
 * Runs against DATABASE_URL (the new ozeco-v2 Neon DB).
 * Re-running leaves the row in the same target state — safe to re-run.
 * READ-ONLY verification round at the start & end confirms the diff.
 */
import { neon } from "@neondatabase/serverless";

const SLUG = "touroll-u1";
const TARGET_STOCK = 10;
const TARGET_BESTSELLER = true;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

type NeonSql = (q: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;
const sql = neon(url) as unknown as NeonSql;

async function readRow() {
  const rows = await sql(
    "SELECT id, name, slug, stock_quantity, is_bestseller FROM products WHERE slug = $1",
    [SLUG]
  );
  return rows[0] as
    | { id: string; name: string; slug: string; stock_quantity: number; is_bestseller: boolean }
    | undefined;
}

async function main() {
  const before = await readRow();
  if (!before) {
    console.error(`No product with slug "${SLUG}" — aborting`);
    process.exit(2);
  }

  console.log("Before:", {
    id: before.id,
    name: before.name,
    stock_quantity: before.stock_quantity,
    is_bestseller: before.is_bestseller,
  });

  const needsUpdate =
    Number(before.stock_quantity) !== TARGET_STOCK ||
    Boolean(before.is_bestseller) !== TARGET_BESTSELLER;

  if (!needsUpdate) {
    console.log("Already at target state — no write needed.");
    return;
  }

  await sql(
    "UPDATE products SET stock_quantity = $1, is_bestseller = $2 WHERE slug = $3",
    [TARGET_STOCK, TARGET_BESTSELLER, SLUG]
  );

  const after = await readRow();
  console.log("After:", {
    stock_quantity: after?.stock_quantity,
    is_bestseller: after?.is_bestseller,
  });

  if (
    Number(after?.stock_quantity) !== TARGET_STOCK ||
    Boolean(after?.is_bestseller) !== TARGET_BESTSELLER
  ) {
    console.error("Verification failed — target state not reached.");
    process.exit(3);
  }
  console.log("✓ Touroll U1 promoted to hero slot.");
}

main().catch((e) => {
  const m = e instanceof Error ? e.message : String(e);
  console.error(m.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgres://***"));
  process.exit(1);
});
