/**
 * READ-ONLY diagnostic — prints the Touroll U1 row + its variants so we can
 * see why the range card renders "Sold out" despite stock_quantity = 10.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }
const sql = neon(url) as unknown as (q: string, p?: unknown[]) => Promise<Array<Record<string, unknown>>>;

async function main() {
  const [product] = await sql(
    "SELECT id, name, slug, stock_quantity, is_bestseller FROM products WHERE slug = $1",
    ["touroll-u1"]
  );
  console.log("PRODUCT:", product);

  const variants = await sql(
    "SELECT id, name, value, price, stock_quantity, image FROM product_variants WHERE product_id = $1",
    [(product as { id: string }).id]
  );
  console.log(`VARIANTS (${variants.length}):`);
  for (const v of variants) console.log(" ", v);

  console.log("\nimages[] on product:");
  const [withImages] = await sql(
    "SELECT images FROM products WHERE slug = $1",
    ["touroll-u1"]
  );
  console.log(withImages);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
