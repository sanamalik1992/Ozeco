"use client";

import { useState } from "react";

export function AddToCartButton({ soldOut }: { soldOut: boolean }) {
  const [toast, setToast] = useState<string | null>(null);

  const onClick = () => {
    setToast("Cart is wired up in the next release.");
    window.clearTimeout((onClick as unknown as { _t?: number })._t);
    (onClick as unknown as { _t?: number })._t = window.setTimeout(
      () => setToast(null),
      2400
    );
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={soldOut}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {soldOut ? "Sold out" : "Add to cart"}
      </button>
      <div
        aria-live="polite"
        className={`text-center text-xs transition-opacity ${
          toast ? "opacity-100" : "opacity-0"
        } ${soldOut ? "text-muted-foreground" : ""}`}
      >
        {toast ?? (soldOut ? "Back in stock soon — join the newsletter for updates." : " ")}
      </div>
    </div>
  );
}
