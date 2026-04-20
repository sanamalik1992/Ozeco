/**
 * Asset origin — product/customer/blog images still live on the old Replit site
 * (ozeco.co.uk) until Phase 3 migrates them to Vercel Blob.
 *
 * Override with NEXT_PUBLIC_ASSET_ORIGIN if you want to point somewhere else
 * (e.g. local dev with `http://localhost:4000`).
 */
export const ASSET_ORIGIN =
  process.env.NEXT_PUBLIC_ASSET_ORIGIN ?? "https://ozeco.co.uk";

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
