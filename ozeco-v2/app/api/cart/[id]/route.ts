import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionId } from "@/lib/session";
import {
  getCartSummary,
  MAX_QTY_PER_LINE,
  removeCartItem,
  updateCartQuantity,
} from "@/lib/db/cart-queries";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = await getSessionId();
  const { id } = await params;

  let body;
  try {
    body = PatchBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", detail: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }

  const updated = await updateCartQuantity(id, body.quantity, sessionId);
  if (!updated) {
    return NextResponse.json(
      { error: "Cart line not found or not owned by this session" },
      { status: 404 }
    );
  }
  const summary = await getCartSummary(sessionId);
  return NextResponse.json({ updated, ...summary });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = await getSessionId();
  const { id } = await params;
  const ok = await removeCartItem(id, sessionId);
  if (!ok) {
    return NextResponse.json(
      { error: "Cart line not found or not owned by this session" },
      { status: 404 }
    );
  }
  const summary = await getCartSummary(sessionId);
  return NextResponse.json(summary);
}
