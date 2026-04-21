"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/db/schema";
import { formatPrice } from "@/lib/assets";
import { AddToCartButton } from "./add-to-cart";

export function VariantSelector({
  basePrice,
  originalPrice,
  baseInStock,
  variants,
}: {
  basePrice: string;
  originalPrice?: string | null;
  baseInStock: boolean;
  variants: ProductVariant[];
}) {
  const groups = useMemo(() => {
    const byName = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      const arr = byName.get(v.name) ?? [];
      arr.push(v);
      byName.set(v.name, arr);
    }
    return Array.from(byName.entries()).map(([name, vs]) => ({ name, variants: vs }));
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string | null>>(() => {
    const init: Record<string, string | null> = {};
    for (const g of groups) {
      const firstInStock = g.variants.find((v) => v.stockQuantity > 0);
      init[g.name] = firstInStock?.id ?? g.variants[0]?.id ?? null;
    }
    return init;
  });

  const chosen = useMemo(() => {
    const ids = Object.values(selected).filter(Boolean) as string[];
    return variants.find((v) => ids.includes(v.id));
  }, [selected, variants]);

  const effectivePrice = chosen?.price ?? basePrice;
  const hasDiscount =
    originalPrice && parseFloat(originalPrice) > parseFloat(effectivePrice);
  const effectiveStock = chosen ? chosen.stockQuantity : baseInStock ? 1 : 0;
  const soldOut = effectiveStock <= 0;

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold tabular-nums">
          {formatPrice(effectivePrice)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(originalPrice!)}
          </span>
        )}
      </div>

      {/* Variant groups */}
      {groups.map((group) => (
        <div key={group.name}>
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {group.name}
            </div>
            <div className="text-xs text-foreground/70">
              {
                group.variants.find((v) => selected[group.name] === v.id)?.value
              }
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.variants.map((v) => {
              const active = selected[group.name] === v.id;
              const oos = v.stockQuantity <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={oos}
                  onClick={() =>
                    setSelected((s) => ({ ...s, [group.name]: v.id }))
                  }
                  aria-pressed={active}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground",
                    oos ? "line-through opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {v.value}
                  {v.price && v.price !== basePrice && !oos && (
                    <span className="text-xs opacity-70">
                      {formatPrice(v.price)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add to cart */}
      <div className="pt-2">
        <AddToCartButton soldOut={soldOut} />
      </div>

      {/* Stock / delivery note */}
      <div className="text-center text-xs text-muted-foreground">
        {soldOut
          ? "Currently sold out"
          : "In stock · ships in 1–2 working days · free UK delivery"}
      </div>
    </div>
  );
}
