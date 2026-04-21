import "server-only";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import {
  cartItems,
  products,
  productVariants,
  type CartItem,
  type Product,
  type ProductVariant,
} from "./schema";

export type CartRow = CartItem & {
  product: Product;
  variant: ProductVariant | null;
  /** unit price at read time in pence — authoritative for summary math. */
  unitPricePence: number;
};

export type CartSummary = {
  items: CartRow[];
  itemCount: number;
  subtotalPence: number;
  subtotal: string; // decimal string in GBP, e.g. "1599.98"
};

const MAX_QTY_PER_LINE = 99;

function unitPrice(product: Product, variant: ProductVariant | null): number {
  const raw =
    variant?.price != null && variant.price !== ""
      ? variant.price
      : product.price;
  return Math.round(parseFloat(raw) * 100);
}

function makeRow(item: CartItem, product: Product, variant: ProductVariant | null): CartRow {
  return { ...item, product, variant, unitPricePence: unitPrice(product, variant) };
}

function summarise(rows: CartRow[]): CartSummary {
  const subtotalPence = rows.reduce((acc, r) => acc + r.unitPricePence * r.quantity, 0);
  const itemCount = rows.reduce((acc, r) => acc + r.quantity, 0);
  return {
    items: rows,
    itemCount,
    subtotalPence,
    subtotal: (subtotalPence / 100).toFixed(2),
  };
}

export async function getCartSummary(sessionId: string): Promise<CartSummary> {
  const rows = await db
    .select({
      cart: cartItems,
      product: products,
      variant: productVariants,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .where(eq(cartItems.sessionId, sessionId))
    .orderBy(asc(cartItems.createdAt));

  const items = rows.map((r) => makeRow(r.cart, r.product, r.variant));
  return summarise(items);
}

export type AddCartResult =
  | { kind: "ok"; item: CartItem }
  | { kind: "invalid_variant" }
  | { kind: "quantity_exceeds"; currentQuantity: number };

/**
 * Upsert a line. Two lines with identical (productId, variantId) are merged
 * into one row with summed quantity, clamped to MAX_QTY_PER_LINE. Returns a
 * structured result so API handlers can map to the right HTTP status.
 */
export async function addToCart(params: {
  sessionId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
}): Promise<AddCartResult> {
  // Validate variant belongs to product if provided.
  if (params.variantId) {
    const [variant] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, params.variantId),
          eq(productVariants.productId, params.productId)
        )
      );
    if (!variant) return { kind: "invalid_variant" };
  }

  const variantCond = params.variantId
    ? eq(cartItems.variantId, params.variantId)
    : isNull(cartItems.variantId);

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.sessionId, params.sessionId),
        eq(cartItems.productId, params.productId),
        variantCond
      )
    );

  if (existing.length > 0) {
    const current = existing[0].quantity;
    const newQty = current + params.quantity;
    if (newQty > MAX_QTY_PER_LINE) {
      return { kind: "quantity_exceeds", currentQuantity: current };
    }
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, existing[0].id))
      .returning();
    return { kind: "ok", item: updated };
  }

  const [inserted] = await db
    .insert(cartItems)
    .values({
      sessionId: params.sessionId,
      productId: params.productId,
      variantId: params.variantId ?? null,
      quantity: params.quantity,
    })
    .returning();
  return { kind: "ok", item: inserted };
}

/**
 * Update the quantity on a line. Session-scoped so one session cannot mutate
 * another's cart. Returns null if the line doesn't exist or isn't owned.
 */
export async function updateCartQuantity(
  id: string,
  quantity: number,
  sessionId: string
): Promise<CartItem | null> {
  const [row] = await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)))
    .returning();
  return row ?? null;
}

export async function removeCartItem(id: string, sessionId: string): Promise<boolean> {
  const rows = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)))
    .returning({ id: cartItems.id });
  return rows.length > 0;
}

export async function clearCart(sessionId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
}

/** Cheap count for header badges — skips the product join. */
export async function getCartCount(sessionId: string): Promise<number> {
  const [row] = await db
    .select({ c: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.sessionId, sessionId));
  return Number(row?.c ?? 0);
}

export { MAX_QTY_PER_LINE };
