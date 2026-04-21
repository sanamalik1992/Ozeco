/**
 * Read-only: count any remaining ozeco.co.uk references in DB image fields
 * post-migration. Expected: 6 (the pre-existing broken paths).
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL!;
const sql = neon(url) as unknown as (q: string) => Promise<Array<Record<string, unknown>>>;

async function main() {
  const checks: Array<{ table: string; q: string }> = [
    { table: "products.image", q: `SELECT slug, image FROM products WHERE image ILIKE '%ozeco.co.uk%'` },
    { table: "products.images[]", q: `SELECT slug, array_to_string(images, ',') AS imgs FROM products WHERE EXISTS (SELECT 1 FROM unnest(images) AS i WHERE i ILIKE '%ozeco.co.uk%')` },
    { table: "product_variants.image", q: `SELECT id, name, value, image FROM product_variants WHERE image ILIKE '%ozeco.co.uk%'` },
    { table: "customer_photos.image_url", q: `SELECT id, customer_name, image_url FROM customer_photos WHERE image_url ILIKE '%ozeco.co.uk%'` },
    { table: "blog_posts.featured_image", q: `SELECT slug, featured_image FROM blog_posts WHERE featured_image ILIKE '%ozeco.co.uk%'` },
  ];

  let total = 0;
  for (const c of checks) {
    const rows = await sql(c.q);
    console.log(`${c.table}: ${rows.length}`);
    for (const r of rows) console.log("   ", JSON.stringify(r));
    total += rows.length;
  }

  console.log(`\ntotal ozeco.co.uk references in DB: ${total}`);

  // Also check for any `/` relative paths that SHOULD have been migrated
  console.log("\nalso-unmigrated relative paths (starting with /):");
  const rels: Array<{ table: string; q: string }> = [
    { table: "products.image", q: `SELECT slug, image FROM products WHERE image LIKE '/%'` },
    { table: "product_variants.image", q: `SELECT id, name, value, image FROM product_variants WHERE image LIKE '/%'` },
    { table: "customer_photos.image_url", q: `SELECT customer_name, image_url FROM customer_photos WHERE image_url LIKE '/%'` },
    { table: "blog_posts.featured_image", q: `SELECT slug, featured_image FROM blog_posts WHERE featured_image LIKE '/%'` },
  ];
  let relTotal = 0;
  for (const c of rels) {
    const rows = await sql(c.q);
    console.log(`${c.table}: ${rows.length}`);
    for (const r of rows) console.log("   ", JSON.stringify(r));
    relTotal += rows.length;
  }
  console.log(`\ntotal relative-path (unmigrated) references: ${relTotal}`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
