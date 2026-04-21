/**
 * Asset origin — product / customer / blog images now live in Vercel Blob.
 * Post Phase 3A migration, every DB image URL is an absolute Blob URL, so
 * assetUrl() is effectively a passthrough for DB data.
 *
 * ASSET_ORIGIN is only consulted for the handful of pre-existing broken
 * relative paths that had no file to migrate (and for dev overrides).
 * Pointing the default at the Blob base URL means those 404 against Blob
 * and trigger the ProductImage onError fallback, same as any other miss.
 *
 * Override with NEXT_PUBLIC_ASSET_ORIGIN for local dev (e.g. a mock server).
 */
export const ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_ASSET_ORIGIN ??
  "https://tg5paiqevb7ejsay.public.blob.vercel-storage.com";

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_ORIGIN}${path.startsWith("/") ? path : "/" + path}`;
}

/** Format money in GBP — DB price is stored as a string decimal. */
export function formatPrice(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}
