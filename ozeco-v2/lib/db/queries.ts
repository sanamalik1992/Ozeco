import "server-only";
import { cache } from "react";
import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "./index";
import {
  blogPosts,
  customerPhotos,
  products,
  productVariants,
  reviews,
  type Product,
  type ProductVariant,
  type ProductWithPricing,
  type Review,
} from "./schema";

/**
 * Enrich a product row with derived fields:
 *  - inStock:           true if product.stockQuantity > 0 OR any variant has stock > 0
 *  - lowestVariantPrice: string | null — lowest in-stock variant price, if variants exist
 *  - displayPrice:       the price shown on cards (variant-aware)
 */
function enrich(
  product: Product,
  variants: ProductVariant[]
): ProductWithPricing {
  // Rule: inStock = stockQuantity > 0, applied at both base and variant level.
  // OR-combined so a product with base stock but zero-stock variant options
  // still reports as in-stock. (Touroll U1 fix — had base=10 but all variants=0.)
  const inStock =
    product.stockQuantity > 0 || variants.some((v) => v.stockQuantity > 0);

  let lowestVariantPrice: string | null = null;
  let displayPrice = product.price;

  if (variants.length > 0) {
    const inStockVariants = variants.filter(
      (v) => v.stockQuantity > 0 && v.price !== null
    );
    if (inStockVariants.length > 0) {
      const lowest = Math.min(
        ...inStockVariants.map((v) => parseFloat(v.price!))
      );
      lowestVariantPrice = lowest.toFixed(2);
      displayPrice = lowestVariantPrice;
    } else {
      const allPriced = variants
        .map((v) => v.price)
        .filter((p): p is string => p !== null)
        .map((p) => parseFloat(p));
      if (allPriced.length > 0) {
        lowestVariantPrice = Math.min(...allPriced).toFixed(2);
        displayPrice = lowestVariantPrice;
      }
    }
  }

  return { ...product, inStock, lowestVariantPrice, displayPrice };
}

async function enrichMany(rows: Product[]): Promise<ProductWithPricing[]> {
  if (rows.length === 0) return [];
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
  return rows.map((p) => enrich(p, byProduct.get(p.id) ?? []));
}

// ─── Product reads ──────────────────────────────────────────────────────

export const getAllProducts = cache(async (): Promise<ProductWithPricing[]> => {
  const rows = await db.select().from(products).orderBy(desc(products.isBestseller), asc(products.name));
  return enrichMany(rows);
});

export const getBestsellers = cache(async (): Promise<ProductWithPricing[]> => {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isBestseller, true))
    .orderBy(asc(products.name));
  return enrichMany(rows);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductWithPricing | null> => {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!row) return null;
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, row.id));
    return enrich(row, variants);
  }
);

export const getVariantsForProduct = cache(
  async (productId: string): Promise<ProductVariant[]> => {
    return db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.name), asc(productVariants.value));
  }
);

export const getRelatedProducts = cache(
  async (
    productId: string,
    brand: string,
    category: string,
    limit = 3
  ): Promise<ProductWithPricing[]> => {
    const rows = await db
      .select()
      .from(products)
      .where(
        and(
          ne(products.id, productId),
          or(eq(products.brand, brand), eq(products.category, category))
        )
      )
      .limit(limit);
    if (rows.length >= limit) return enrichMany(rows);
    // pad with other products if we don't have enough related
    const padRows = await db
      .select()
      .from(products)
      .where(ne(products.id, productId))
      .limit(limit);
    const merged = [...rows];
    for (const r of padRows) {
      if (merged.length >= limit) break;
      if (!merged.some((m) => m.id === r.id)) merged.push(r);
    }
    return enrichMany(merged);
  }
);

// ─── Reviews ────────────────────────────────────────────────────────────

export const getReviewsForProduct = cache(
  async (
    productId: string
  ): Promise<{
    items: Review[];
    total: number;
    average: number;
    breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  }> => {
    const items = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(50);

    const agg = await db
      .select({
        total: count(reviews.id),
        avg: avg(reviews.rating).mapWith(Number),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const byStarRows = await db
      .select({
        rating: reviews.rating,
        c: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .groupBy(reviews.rating);

    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    };
    for (const r of byStarRows) {
      const k = r.rating as 1 | 2 | 3 | 4 | 5;
      if (k >= 1 && k <= 5) breakdown[k] = Number(r.c);
    }

    return {
      items,
      total: Number(agg[0]?.total ?? 0),
      average: Number(agg[0]?.avg ?? 0),
      breakdown,
    };
  }
);

export const getFeaturedReviews = cache(
  async (limit = 6): Promise<(Review & { productName: string; productSlug: string })[]> => {
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        customerName: reviews.customerName,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        verified: reviews.verified,
        createdAt: reviews.createdAt,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(eq(reviews.rating, 5))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
    return rows;
  }
);

// ─── Customer photos ────────────────────────────────────────────────────

export const getApprovedCustomerPhotos = cache(
  async (limit = 12) => {
    const rows = await db
      .select({
        id: customerPhotos.id,
        customerName: customerPhotos.customerName,
        imageUrl: customerPhotos.imageUrl,
        caption: customerPhotos.caption,
        productId: customerPhotos.productId,
        productSlug: products.slug,
        productName: products.name,
      })
      .from(customerPhotos)
      .innerJoin(products, eq(customerPhotos.productId, products.id))
      .where(eq(customerPhotos.approved, true))
      .orderBy(desc(customerPhotos.createdAt))
      .limit(limit);
    return rows;
  }
);

export const getCustomerPhotosForProduct = cache(
  async (productId: string, limit = 8) => {
    const rows = await db
      .select()
      .from(customerPhotos)
      .where(
        and(
          eq(customerPhotos.productId, productId),
          eq(customerPhotos.approved, true)
        )
      )
      .orderBy(desc(customerPhotos.createdAt))
      .limit(limit);
    return rows;
  }
);

// ─── Blog ───────────────────────────────────────────────────────────────

export const getLatestBlogPosts = cache(async (limit = 3) => {
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedDate))
    .limit(limit);
});

// ─── Distinct brands (for logo strip) ───────────────────────────────────

export const getBrands = cache(async () => {
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
});

// ─── Homepage hero: pick the in-stock bestseller with most reviews ──────

export const getHeroProduct = cache(async (): Promise<ProductWithPricing | null> => {
  const row = await db
    .select({
      product: products,
      reviewCount: sql<number>`count(${reviews.id})::int`,
    })
    .from(products)
    .leftJoin(reviews, eq(reviews.productId, products.id))
    .where(eq(products.isBestseller, true))
    .groupBy(products.id)
    .orderBy(desc(sql<number>`count(${reviews.id})`))
    .limit(1);
  if (!row[0]) {
    // fall back to any product with the most reviews
    const alt = await db
      .select({ product: products })
      .from(products)
      .leftJoin(reviews, eq(reviews.productId, products.id))
      .groupBy(products.id)
      .orderBy(desc(sql<number>`count(${reviews.id})`))
      .limit(1);
    if (!alt[0]) return null;
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, alt[0].product.id));
    return enrich(alt[0].product, variants);
  }
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, row[0].product.id));
  return enrich(row[0].product, variants);
});

// Spotlight = second bestseller (or next-most-reviewed after hero)
export const getSpotlightProduct = cache(
  async (excludeId?: string): Promise<ProductWithPricing | null> => {
    const rows = await db
      .select({
        product: products,
        reviewCount: sql<number>`count(${reviews.id})::int`,
      })
      .from(products)
      .leftJoin(reviews, eq(reviews.productId, products.id))
      .groupBy(products.id)
      .orderBy(desc(sql<number>`count(${reviews.id})`))
      .limit(5);
    const chosen = rows.find((r) => r.product.id !== excludeId)?.product;
    if (!chosen) return null;
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, chosen.id));
    return enrich(chosen, variants);
  }
);
