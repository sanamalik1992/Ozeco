/**
 * Read-only: list every DB image URL and categorise each as
 *   - would-rewrite (manifest hit)
 *   - skip-external / already-blob
 *   - skip-no-manifest-entry (old path missing from manifest)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const MANIFEST_PATH = join(process.cwd(), "scripts/image-migration-manifest.json");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Record<string, string>;

const url = process.env.DATABASE_URL!;
const sql = neon(url) as unknown as (q: string, p?: unknown[]) => Promise<Array<Record<string, unknown>>>;

function toKey(u: string | null): string | null {
  if (!u) return null;
  if (u.includes("blob.vercel-storage.com")) return null;
  try {
    if (/^https?:\/\//i.test(u)) {
      const parsed = new URL(u);
      if (/ozeco\.co\.uk$/i.test(parsed.hostname)) return parsed.pathname.replace(/^\/+/, "");
      return null;
    }
  } catch {}
  return u.replace(/^\/+/, "");
}

async function main() {
  const pairs: Array<{ table: string; id: string; column: string; url: string }> = [];
  for (const r of await sql(`SELECT id, slug, image FROM products`)) {
    if (r.image) pairs.push({ table: "products", id: r.slug as string, column: "image", url: r.image as string });
  }
  for (const r of await sql(`SELECT id, slug, images FROM products`)) {
    (r.images as string[]).forEach((u, i) =>
      pairs.push({ table: "products", id: r.slug as string, column: `images[${i}]`, url: u })
    );
  }
  for (const r of await sql(`SELECT id, name, value, image FROM product_variants WHERE image IS NOT NULL`)) {
    pairs.push({ table: "product_variants", id: `${(r.id as string).slice(0, 8)} ${r.name}:${r.value}`, column: "image", url: r.image as string });
  }
  for (const r of await sql(`SELECT id, customer_name, image_url FROM customer_photos`)) {
    pairs.push({ table: "customer_photos", id: `${(r.id as string).slice(0, 8)} ${r.customer_name}`, column: "image_url", url: r.image_url as string });
  }
  for (const r of await sql(`SELECT id, slug, featured_image FROM blog_posts`)) {
    pairs.push({ table: "blog_posts", id: r.slug as string, column: "featured_image", url: r.featured_image as string });
  }

  const skips: typeof pairs = [];
  for (const p of pairs) {
    const key = toKey(p.url);
    if (!key) continue; // already blob or external
    if (!manifest[key]) {
      // Try alternative extensions to see if it's a simple ext mismatch
      const base = key.replace(/\.[^./]+$/, "");
      const found: string[] = [];
      for (const ext of [".png", ".jpg", ".jpeg", ".webp", ".gif"]) {
        if (manifest[base + ext]) found.push(base + ext);
      }
      skips.push({ ...p, url: `${p.url}    ← ${found.length > 0 ? "FIX: " + found.join(" or ") : "NO REPLACEMENT FOUND"}` });
    }
  }

  console.log(`Skipped ${skips.length} values. Detail:\n`);
  const byTable = new Map<string, typeof skips>();
  for (const s of skips) {
    const arr = byTable.get(s.table) ?? [];
    arr.push(s);
    byTable.set(s.table, arr);
  }
  for (const [t, ss] of byTable) {
    console.log(`\n[${t}] ${ss.length}`);
    for (const s of ss) console.log(`  ${s.id} · ${s.column} = ${s.url}`);
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
