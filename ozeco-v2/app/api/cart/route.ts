import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionId } from "@/lib/session";
import {
  addToCart,
  clearCart,
  getCartSummary,
  MAX_QTY_PER_LINE,
} from "@/lib/db/cart-queries";

export const dynamic = "force-dynamic";

const AddBody = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE).default(1),
});

export async function GET() {
  const sessionId = await getSessionId();
  const summary = await getCartSummary(sessionId);
  return NextResponse.json(summary);
}

export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();
  let parsed;
  try {
    parsed = AddBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  const result = await addToCart({
    sessionId,
    productId: parsed.productId,
    variantId: parsed.variantId ?? null,
    quantity: parsed.quantity,
  });

  if (result.kind === "invalid_variant") {
    return NextResponse.json(
      { error: "Variant does not belong to this product" },
      { status: 400 }
    );
  }
  if (result.kind === "quantity_exceeds") {
    return NextResponse.json(
      {
        error: `Maximum ${MAX_QTY_PER_LINE} per line. You already have ${result.currentQuantity} in your cart.`,
      },
      { status: 400 }
    );
  }

  const summary = await getCartSummary(sessionId);
  return NextResponse.json({ added: result.item, ...summary }, { status: 201 });
}

export async function DELETE() {
  const sessionId = await getSessionId();
  await clearCart(sessionId);
  return new NextResponse(null, { status: 204 });
}
