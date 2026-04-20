/**
 * Find the product with the most reviews — one-shot diagnostic.
 * READ ONLY. Used to pick the Phase 2 example slug.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }
const sql = neon(url) as unknown as (q: string) => Promise<Array<Record<string, unknown>>>;

async function main() {
  const rows = await sql(`
    SELECT p.slug, p.name, p.brand, COUNT(r.id)::int AS review_count,
           ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
           p.stock_quantity, p.is_bestseller
    FROM products p
    LEFT JOIN reviews r ON r.product_id = p.id
    GROUP BY p.id
    ORDER BY review_count DESC, avg_rating DESC
    LIMIT 10
  `);
  for (const r of rows) console.log(r);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
