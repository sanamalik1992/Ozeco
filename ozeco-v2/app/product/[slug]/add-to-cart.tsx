"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "adding" | "added" | "err";

export function AddToCartButton({
  productId,
  variantId,
  soldOut,
}: {
  productId: string;
  variantId: string | null;
  soldOut: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onClick() {
    if (soldOut || status === "adding") return;
    setStatus("adding");
    setMessage(null);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity: 1 }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Could not add to cart");
      }
      setStatus("added");
      startTransition(() => router.refresh());
      window.setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 2400);
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      window.setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 3200);
    }
  }

  const label =
    soldOut
      ? "Sold out"
      : status === "adding"
      ? "Adding…"
      : status === "added"
      ? "Added to cart ✓"
      : "Add to cart";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={soldOut || status === "adding"}
        aria-live="polite"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
      </button>
      <div
        aria-live="polite"
        className={`text-center text-xs ${
          status === "err" ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {message ??
          (soldOut
            ? "Back in stock soon — join the newsletter for updates."
            : " ")}
      </div>
    </div>
  );
}
