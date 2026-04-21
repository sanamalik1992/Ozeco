/**
 * Sample DB image URLs to understand formats across products/variants/photos/blog.
 * READ-ONLY.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }
const sql = neon(url) as unknown as (q: string, p?: unknown[]) => Promise<Array<Record<string, unknown>>>;

async function main() {
  console.log("=== products (image + images[0..1]) ===");
  for (const row of await sql(`SELECT slug, image, images FROM products ORDER BY slug LIMIT 5`)) {
    console.log(" ", row.slug, ":", row.image);
    console.log("     images[]:", JSON.stringify(row.images).slice(0, 140));
  }
  console.log("\n=== product_variants.image (first 5 with non-null) ===");
  for (const row of await sql(`SELECT product_id, name, value, image FROM product_variants WHERE image IS NOT NULL LIMIT 5`)) {
    console.log(" ", row.name, row.value, "→", row.image);
  }
  console.log("\n=== customer_photos (first 5) ===");
  for (const row of await sql(`SELECT customer_name, image_url FROM customer_photos LIMIT 5`)) {
    console.log(" ", row.customer_name, "→", row.image_url);
  }
  console.log("\n=== blog_posts.featured_image ===");
  for (const row of await sql(`SELECT slug, featured_image FROM blog_posts LIMIT 5`)) {
    console.log(" ", row.slug, "→", row.featured_image);
  }

  console.log("\n=== distinct URL-origin patterns ===");
  const patterns: Record<string, number> = {};
  const bump = (u: string | null) => {
    if (!u) return;
    const key = /^https?:\/\/[^\/]+/.exec(u)?.[0] ?? (u.startsWith("/") ? "<relative>" : "<other>");
    patterns[key] = (patterns[key] ?? 0) + 1;
  };
  for (const r of await sql(`SELECT image FROM products`)) bump(r.image as string);
  for (const r of await sql(`SELECT unnest(images) AS image FROM products`)) bump(r.image as string);
  for (const r of await sql(`SELECT image FROM product_variants WHERE image IS NOT NULL`)) bump(r.image as string);
  for (const r of await sql(`SELECT image_url FROM customer_photos`)) bump(r.image_url as string);
  for (const r of await sql(`SELECT featured_image FROM blog_posts`)) bump(r.featured_image as string);
  for (const [k, v] of Object.entries(patterns)) console.log(` ${v.toString().padStart(4)}  ${k}`);
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
