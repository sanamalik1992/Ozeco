import "server-only";
import { and, asc, desc, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "./index";
import {
  products,
  productVariants,
  type ProductVariant,
  type ProductWithPricing,
} from "./schema";

export type ShopSort = "bestseller" | "price-asc" | "price-desc" | "newest";
export type ShopFilters = {
  brands?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export type ShopFacets = {
  brands: { value: string; count: number }[];
  categories: { value: string; count: number }[];
  priceRange: { min: number; max: number };
  totalProducts: number;
};

/**
 * Read-only facet data for the filter sidebar. Derived from DB — never hardcoded.
 */
export async function getShopFacets(): Promise<ShopFacets> {
  const brandsResult = await db
    .select({ value: products.brand, count: sql<number>`count(*)::int` })
    .from(products)
    .groupBy(products.brand)
    .orderBy(products.brand);

  const categoriesResult = await db
    .select({ value: products.category, count: sql<number>`count(*)::int` })
    .from(products)
    .groupBy(products.category)
    .orderBy(products.category);

  const priceRow = await db
    .select({
      min: sql<string>`min(${products.price})`,
      max: sql<string>`max(${products.price})`,
      total: sql<number>`count(*)::int`,
    })
    .from(products);

  const min = priceRow[0]?.min ? parseFloat(priceRow[0].min) : 0;
  const max = priceRow[0]?.max ? parseFloat(priceRow[0].max) : 0;

  return {
    brands: brandsResult.map((r) => ({ value: r.value, count: Number(r.count) })),
    categories: categoriesResult.map((r) => ({ value: r.value, count: Number(r.count) })),
    priceRange: { min: Math.floor(min), max: Math.ceil(max) },
    totalProducts: Number(priceRow[0]?.total ?? 0),
  };
}

function orderClause(sortBy: ShopSort) {
  switch (sortBy) {
    case "price-asc":
      return [asc(sql`${products.price}::numeric`)];
    case "price-desc":
      return [desc(sql`${products.price}::numeric`)];
    case "newest":
      return [desc(products.createdAt)];
    case "bestseller":
    default:
      return [desc(products.isBestseller), desc(products.createdAt)];
  }
}

/**
 * Query products with filters, sort, limit. Returns enriched products (inStock,
 * lowestVariantPrice, displayPrice).
 */
export async function getShopProducts(
  filters: ShopFilters,
  sortBy: ShopSort,
  limit = 24
): Promise<ProductWithPricing[]> {
  const conds = [];
  if (filters.brands && filters.brands.length > 0) {
    conds.push(inArray(products.brand, filters.brands));
  }
  if (filters.categories && filters.categories.length > 0) {
    conds.push(inArray(products.category, filters.categories));
  }
  if (typeof filters.minPrice === "number") {
    conds.push(gte(sql`${products.price}::numeric`, filters.minPrice));
  }
  if (typeof filters.maxPrice === "number") {
    conds.push(lte(sql`${products.price}::numeric`, filters.maxPrice));
  }

  const rows = await db
    .select()
    .from(products)
    .where(conds.length > 0 ? and(...conds) : undefined)
    .orderBy(...orderClause(sortBy))
    .limit(limit);

  if (rows.length === 0) return [];

  // Load variants in one query for all matched products.
  const ids = rows.map((r) => r.id);
  const allVariants = await db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.productId, ids));
  const byProduct = new Map<string, ProductVariant[]>();
  for (const v of allVariants) {
    const arr = byProduct.get(v.productId) ?? [];
    arr.push(v);
    byProduct.set(v.productId, arr);
  }

  const enriched = rows.map((p) => {
    const variants = byProduct.get(p.id) ?? [];
    const inStockBase = p.stockQuantity > 0;
    const inStockVariants = variants.some((v) => v.stockQuantity > 0);
    const inStock = inStockBase || inStockVariants;

    let lowestVariantPrice: string | null = null;
    let displayPrice = p.price;
    if (variants.length > 0) {
      const priced = variants.filter((v) => v.stockQuantity > 0 && v.price !== null);
      if (priced.length > 0) {
        const lo = Math.min(...priced.map((v) => parseFloat(v.price!)));
        lowestVariantPrice = lo.toFixed(2);
        displayPrice = lowestVariantPrice;
      } else {
        const anyPriced = variants
          .map((v) => v.price)
          .filter((p): p is string => p !== null)
          .map((p) => parseFloat(p));
        if (anyPriced.length > 0) {
          lowestVariantPrice = Math.min(...anyPriced).toFixed(2);
          displayPrice = lowestVariantPrice;
        }
      }
    }

    return {
      ...p,
      inStock,
      lowestVariantPrice,
      displayPrice,
    } satisfies ProductWithPricing;
  });

  // `inStock` filter must run AFTER enrichment since it depends on variant stock.
  return filters.inStock
    ? enriched.filter((p) => p.inStock)
    : enriched;
}
