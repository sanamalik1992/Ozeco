"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/db/schema";
import { formatPrice } from "@/lib/assets";

/**
 * Variants are stored as flat rows with (name, value). A product like "Colour: Red"
 * + "Colour: Black" forms one group. This selector handles N groups and picks
 * a combination — though the old site only ever used single-axis (colour OR size),
 * so we render each group as a simple row of buttons.
 */
export function VariantSelector({
  basePrice,
  inStock,
  variants,
}: {
  basePrice: string;
  inStock: boolean;
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
  const effectiveStock = chosen ? chosen.stockQuantity : inStock ? 1 : 0;
  const disabled = effectiveStock <= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold tabular-nums">
          {formatPrice(effectivePrice)}
        </span>
      </div>

      {groups.map((group) => (
        <div key={group.name}>
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {group.name}
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
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-border bg-card text-foreground hover:border-ink",
                    oos ? "line-through opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {v.value}
                  {v.price && v.price !== basePrice && (
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

      <div className="pt-2 space-y-3">
        <button
          type="button"
          disabled={disabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-semibold text-paper transition-opacity hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Sold out" : "Add to cart"}
        </button>
        <div className="text-center text-xs text-muted-foreground">
          Free UK delivery · 3–5 working days
        </div>
      </div>
    </div>
  );
}
