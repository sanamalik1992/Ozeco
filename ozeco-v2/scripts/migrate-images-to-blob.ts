/**
 * migrate-images-to-blob.ts
 *
 * One-shot, idempotent: upload every image from the Replit-era public/ tree
 * to Vercel Blob, preserving the original path so DB URLs can be rewritten
 * with a simple prefix swap later.
 *
 * Intended source (per Phase 3A brief): exports/images.tar.gz
 * Actual source (that file doesn't exist in the repo): /home/user/Ozeco/public/
 *   — same content, already extracted. Flagged in the checkpoint report.
 *
 * Env required:
 *   BLOB_READ_WRITE_TOKEN   — from Vercel dashboard. Auto-injected in
 *                             Vercel builds; for local dev you must set it
 *                             explicitly in ozeco-v2/.env.local.
 *
 * Idempotent: if a file already exists in Blob (by pathname), the upload is
 * skipped and the existing URL is recorded in the manifest.
 *
 * Writes: scripts/image-migration-manifest.json
 *   { "products/touroll-u1/1.png": "https://<id>.public.blob.vercel-storage.com/..." }
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { list, put } from "@vercel/blob";

const SOURCE_ROOT = "/home/user/Ozeco/public";
const MANIFEST_PATH = join(process.cwd(), "scripts/image-migration-manifest.json");

type Manifest = Record<string, string>;

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listFilesRecursive(full));
    else if (st.isFile()) out.push(full);
  }
  return out;
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"]);
function isImage(path: string): boolean {
  const i = path.lastIndexOf(".");
  if (i < 0) return false;
  return IMAGE_EXTS.has(path.slice(i).toLowerCase());
}

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
};

function contentType(path: string): string {
  const i = path.lastIndexOf(".");
  return i < 0 ? "application/octet-stream" : CONTENT_TYPES[path.slice(i).toLowerCase()] ?? "application/octet-stream";
}

function loadManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveManifest(m: Manifest) {
  const sorted = Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + "\n");
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "BLOB_READ_WRITE_TOKEN is not set. Generate one in the Vercel dashboard:\n" +
      "  Project → Storage → Connect Store → Blob → Create new store → .env.local → copy token"
    );
    process.exit(1);
  }

  // What's already in Blob? Build a set of pathnames so we can skip duplicates.
  const existing = new Map<string, string>(); // pathname → url
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    for (const b of page.blobs) existing.set(b.pathname, b.url);
    cursor = page.cursor;
  } while (cursor);
  console.log(`[blob] ${existing.size} objects already in store`);

  const manifest = loadManifest();
  const files = listFilesRecursive(SOURCE_ROOT).filter(isImage);
  console.log(`[src] ${files.length} images under ${SOURCE_ROOT}`);

  let uploaded = 0;
  let skippedAlready = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const abs = files[i];
    const pathname = relative(SOURCE_ROOT, abs); // "products/touroll-u1/1.png"

    if (existing.has(pathname)) {
      manifest[pathname] = existing.get(pathname)!;
      skippedAlready++;
      if (i % 25 === 0) {
        console.log(`[${i + 1}/${files.length}] skip (exists): ${pathname}`);
      }
      continue;
    }

    try {
      const bytes = readFileSync(abs);
      const blob = await put(pathname, bytes, {
        access: "public",
        contentType: contentType(abs),
        addRandomSuffix: false,
        allowOverwrite: false,
      });
      manifest[pathname] = blob.url;
      uploaded++;
      console.log(`[${i + 1}/${files.length}] upload: ${pathname} → ${blob.url.slice(0, 60)}…`);
      // Save manifest incrementally so a crash doesn't lose progress.
      if (uploaded % 10 === 0) saveManifest(manifest);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${i + 1}/${files.length}] FAIL: ${pathname} — ${msg}`);
    }
  }

  saveManifest(manifest);
  console.log("\n=== summary ===");
  console.log(`  source files:       ${files.length}`);
  console.log(`  uploaded:           ${uploaded}`);
  console.log(`  skipped (existing): ${skippedAlready}`);
  console.log(`  failed:             ${failed}`);
  console.log(`  manifest entries:   ${Object.keys(manifest).length}`);
  console.log(`  manifest:           ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
