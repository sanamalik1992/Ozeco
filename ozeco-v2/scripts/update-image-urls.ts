/**
 * update-image-urls.ts
 *
 * Rewrite every image URL in the DB so it points at Vercel Blob instead of
 * the Replit-era path (or absolute ozeco.co.uk URL).
 *
 * Reads: scripts/image-migration-manifest.json
 * Updates:
 *   - products.image
 *   - products.images[] (text[])
 *   - product_variants.image (nullable)
 *   - customer_photos.image_url
 *   - blog_posts.featured_image
 *
 * DEFAULT IS DRY-RUN. Prints every proposed change. Nothing writes unless
 * --apply is passed.
 *
 * Safe to re-run.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const MANIFEST_PATH = join(process.cwd(), "scripts/image-migration-manifest.json");
const APPLY = process.argv.includes("--apply");

type Manifest = Record<string, string>;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const sql = neon(url) as unknown as (
  q: string,
  p?: unknown[]
) => Promise<Array<Record<string, unknown>>>;

/**
 * Normalise an incoming URL to a key we can look up in the manifest.
 * Handles:
 *   "/products/foo/1.png"                     → "products/foo/1.png"
 *   "https://www.ozeco.co.uk/products/..."    → "products/..."
 *   "http://ozeco.co.uk/customer-photos/..."  → "customer-photos/..."
 */
function toManifestKey(u: string | null | undefined): string | null {
  if (!u) return null;
  if (u.startsWith("https://") && u.includes("blob.vercel-storage.com")) {
    return null; // already migrated — noop
  }
  try {
    if (/^https?:\/\//i.test(u)) {
      const parsed = new URL(u);
      if (/ozeco\.co\.uk$/i.test(parsed.hostname)) {
        return parsed.pathname.replace(/^\/+/, "");
      }
      return null; // external URL we don't own
    }
  } catch {
    // fall through
  }
  return u.replace(/^\/+/, "");
}

type Change = { table: string; id: string; column: string; old: string; new: string };
type Skip = { table: string; id: string; column: string; value: string; reason: string };

function lookup(manifest: Manifest, u: string | null, table: string, id: string, column: string, changes: Change[], skips: Skip[]) {
  if (!u) return u; // no-op for nulls
  const key = toManifestKey(u);
  if (key === null) {
    // already migrated or external — leave alone
    if (u.includes("blob.vercel-storage.com")) return u;
    skips.push({ table, id, column, value: u, reason: "already-migrated-or-external" });
    return u;
  }
  const newUrl = manifest[key];
  if (!newUrl) {
    skips.push({ table, id, column, value: u, reason: "no-manifest-entry" });
    return u;
  }
  if (newUrl !== u) {
    changes.push({ table, id, column, old: u, new: newUrl });
  }
  return newUrl;
}

async function processProducts(manifest: Manifest, changes: Change[], skips: Skip[]) {
  const rows = await sql(`SELECT id, slug, image, images FROM products`) as Array<{ id: string; slug: string; image: string; images: string[] }>;
  const updates: Array<{ id: string; image: string; images: string[] }> = [];

  for (const r of rows) {
    const newImage = lookup(manifest, r.image, "products", r.slug, "image", changes, skips) ?? "";
    const newImages = r.images.map((u, i) =>
      lookup(manifest, u, "products", r.slug, `images[${i}]`, changes, skips) ?? u
    );
    if (newImage !== r.image || newImages.some((v, i) => v !== r.images[i])) {
      updates.push({ id: r.id, image: newImage as string, images: newImages });
    }
  }

  if (APPLY) {
    for (const u of updates) {
      await sql(
        `UPDATE products SET image = $1, images = $2 WHERE id = $3`,
        [u.image, u.images, u.id]
      );
    }
  }
  return updates.length;
}

async function processVariants(manifest: Manifest, changes: Change[], skips: Skip[]) {
  const rows = await sql(
    `SELECT id, name, value, image FROM product_variants WHERE image IS NOT NULL`
  ) as Array<{ id: string; name: string; value: string; image: string }>;
  let count = 0;
  for (const r of rows) {
    const newImage = lookup(manifest, r.image, "product_variants", `${r.id.slice(0, 8)} ${r.name}:${r.value}`, "image", changes, skips);
    if (newImage !== r.image) {
      if (APPLY) await sql(`UPDATE product_variants SET image = $1 WHERE id = $2`, [newImage, r.id]);
      count++;
    }
  }
  return count;
}

async function processCustomerPhotos(manifest: Manifest, changes: Change[], skips: Skip[]) {
  const rows = await sql(
    `SELECT id, customer_name, image_url FROM customer_photos`
  ) as Array<{ id: string; customer_name: string; image_url: string }>;
  let count = 0;
  for (const r of rows) {
    const newUrl = lookup(manifest, r.image_url, "customer_photos", `${r.id.slice(0, 8)} ${r.customer_name}`, "image_url", changes, skips);
    if (newUrl !== r.image_url) {
      if (APPLY) await sql(`UPDATE customer_photos SET image_url = $1 WHERE id = $2`, [newUrl, r.id]);
      count++;
    }
  }
  return count;
}

async function processBlogPosts(manifest: Manifest, changes: Change[], skips: Skip[]) {
  const rows = await sql(
    `SELECT id, slug, featured_image FROM blog_posts`
  ) as Array<{ id: string; slug: string; featured_image: string }>;
  let count = 0;
  for (const r of rows) {
    const newUrl = lookup(manifest, r.featured_image, "blog_posts", r.slug, "featured_image", changes, skips);
    if (newUrl !== r.featured_image) {
      if (APPLY) await sql(`UPDATE blog_posts SET featured_image = $1 WHERE id = $2`, [newUrl, r.id]);
      count++;
    }
  }
  return count;
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  const manifestEntries = Object.keys(manifest).length;
  if (manifestEntries === 0) {
    console.error("Manifest is empty — run migrate-images-to-blob.ts first");
    process.exit(1);
  }
  console.log(`[manifest] ${manifestEntries} entries`);
  console.log(`[mode] ${APPLY ? "APPLY — writes will hit the DB" : "DRY-RUN — nothing will be written"}`);

  const changes: Change[] = [];
  const skips: Skip[] = [];

  const productUpdates = await processProducts(manifest, changes, skips);
  const variantUpdates = await processVariants(manifest, changes, skips);
  const photoUpdates = await processCustomerPhotos(manifest, changes, skips);
  const blogUpdates = await processBlogPosts(manifest, changes, skips);

  console.log("\n=== proposed changes ===");
  const byTable = new Map<string, Change[]>();
  for (const c of changes) {
    const arr = byTable.get(c.table) ?? [];
    arr.push(c);
    byTable.set(c.table, arr);
  }
  for (const [table, cs] of byTable) {
    console.log(`\n[${table}] ${cs.length} columns to rewrite`);
    for (const c of cs.slice(0, 5)) {
      console.log(`  ${c.id} · ${c.column}`);
      console.log(`    - ${c.old}`);
      console.log(`    + ${c.new}`);
    }
    if (cs.length > 5) console.log(`  …and ${cs.length - 5} more`);
  }

  console.log("\n=== skips ===");
  const bySkipReason = new Map<string, Skip[]>();
  for (const s of skips) {
    const arr = bySkipReason.get(s.reason) ?? [];
    arr.push(s);
    bySkipReason.set(s.reason, arr);
  }
  for (const [reason, ss] of bySkipReason) {
    console.log(`\n[${reason}] ${ss.length} values left alone`);
    for (const s of ss.slice(0, 5)) {
      console.log(`  ${s.table}.${s.column} · ${s.id} = ${s.value}`);
    }
    if (ss.length > 5) console.log(`  …and ${ss.length - 5} more`);
  }

  console.log("\n=== summary ===");
  console.log(`  products rows updated:         ${productUpdates}`);
  console.log(`  product_variants rows updated: ${variantUpdates}`);
  console.log(`  customer_photos rows updated:  ${photoUpdates}`);
  console.log(`  blog_posts rows updated:       ${blogUpdates}`);
  console.log(`  total columns rewritten:       ${changes.length}`);
  console.log(`  total values skipped:          ${skips.length}`);
  console.log(`  mode: ${APPLY ? "APPLIED" : "DRY-RUN (pass --apply to commit)"}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
