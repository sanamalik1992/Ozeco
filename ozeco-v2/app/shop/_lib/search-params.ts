import type { ShopFilters, ShopSort } from "@/lib/db/shop-queries";

export const SORTS = ["bestseller", "price-asc", "price-desc", "newest"] as const;
export const SORT_LABELS: Record<ShopSort, string> = {
  bestseller: "Bestsellers",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
};

function splitCsv(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntOr(value: string | string[] | undefined, fallback: number): number {
  if (!value) return fallback;
  const raw = Array.isArray(value) ? value[0] : value;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export type ShopSearchParams = Record<string, string | string[] | undefined>;

export function parseShopParams(
  search: ShopSearchParams,
  priceBounds: { min: number; max: number }
): { filters: ShopFilters; sort: ShopSort } {
  const sortRaw = Array.isArray(search.sort) ? search.sort[0] : search.sort;
  const sort: ShopSort =
    (SORTS as readonly string[]).includes(sortRaw as string)
      ? (sortRaw as ShopSort)
      : "bestseller";

  const filters: ShopFilters = {
    brands: splitCsv(search.brand),
    categories: splitCsv(search.category),
    inStock: search.stock === "1" || search.stock === "true",
  };

  const minP = parseIntOr(search.minPrice, priceBounds.min);
  const maxP = parseIntOr(search.maxPrice, priceBounds.max);
  if (minP > priceBounds.min) filters.minPrice = minP;
  if (maxP < priceBounds.max) filters.maxPrice = maxP;

  return { filters, sort };
}

export function buildShopHref(params: {
  brands: string[];
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: ShopSort;
}): string {
  const q = new URLSearchParams();
  if (params.brands.length > 0) q.set("brand", params.brands.join(","));
  if (params.categories.length > 0) q.set("category", params.categories.join(","));
  if (typeof params.minPrice === "number") q.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") q.set("maxPrice", String(params.maxPrice));
  if (params.inStock) q.set("stock", "1");
  if (params.sort !== "bestseller") q.set("sort", params.sort);
  const qs = q.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
