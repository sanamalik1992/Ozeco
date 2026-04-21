"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ShopFacets } from "@/lib/db/shop-queries";
import { buildShopHref, SORTS, SORT_LABELS } from "../_lib/search-params";
import type { ShopSort } from "@/lib/db/shop-queries";
import { formatPrice } from "@/lib/assets";

export function FiltersSidebar({ facets }: { facets: ShopFacets }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = useMemo(() => {
    const brands = (params.get("brand") ?? "").split(",").filter(Boolean);
    const categories = (params.get("category") ?? "").split(",").filter(Boolean);
    const minPrice = params.has("minPrice") ? parseInt(params.get("minPrice")!, 10) : undefined;
    const maxPrice = params.has("maxPrice") ? parseInt(params.get("maxPrice")!, 10) : undefined;
    const inStock = params.get("stock") === "1" || params.get("stock") === "true";
    const sort = ((params.get("sort") as ShopSort | null) ?? "bestseller") as ShopSort;
    return { brands, categories, minPrice, maxPrice, inStock, sort };
  }, [params]);

  const push = useCallback(
    (next: {
      brands?: string[];
      categories?: string[];
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      sort?: ShopSort;
    }) => {
      const merged = {
        brands: next.brands ?? current.brands,
        categories: next.categories ?? current.categories,
        minPrice: next.minPrice ?? current.minPrice,
        maxPrice: next.maxPrice ?? current.maxPrice,
        inStock: next.inStock ?? current.inStock,
        sort: next.sort ?? current.sort,
      };
      startTransition(() => router.push(buildShopHref(merged), { scroll: false }));
    },
    [current, router]
  );

  const toggleInArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const clearAll = () => {
    startTransition(() => router.push("/shop", { scroll: false }));
  };

  const anyFilterActive =
    current.brands.length > 0 ||
    current.categories.length > 0 ||
    typeof current.minPrice === "number" ||
    typeof current.maxPrice === "number" ||
    current.inStock;

  const [priceMin, setPriceMin] = useState<string>(
    current.minPrice !== undefined ? String(current.minPrice) : ""
  );
  const [priceMax, setPriceMax] = useState<string>(
    current.maxPrice !== undefined ? String(current.maxPrice) : ""
  );

  return (
    <aside className="md:sticky md:top-24 md:self-start">
      {/* Mobile: toggle button */}
      <button
        type="button"
        className="inline-flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span>
          Filters
          {anyFilterActive && (
            <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
              {current.brands.length + current.categories.length + (current.inStock ? 1 : 0) + (typeof current.minPrice === "number" ? 1 : 0) + (typeof current.maxPrice === "number" ? 1 : 0)}
            </span>
          )}
        </span>
        <span className="text-xs">{mobileOpen ? "Hide" : "Show"}</span>
      </button>

      <div
        className={`${
          mobileOpen ? "block" : "hidden"
        } mt-4 space-y-10 md:mt-0 md:block ${isPending ? "opacity-60" : ""}`}
      >
        {anyFilterActive && (
          <div>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium uppercase tracking-widest text-foreground underline underline-offset-4 decoration-1 hover:decoration-2"
            >
              Clear all filters
            </button>
          </div>
        )}

        <FilterGroup title="Brand">
          {facets.brands.map((b) => {
            const checked = current.brands.includes(b.value);
            return (
              <label key={b.value} className="flex items-center gap-3 py-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    push({ brands: toggleInArray(current.brands, b.value) })
                  }
                  className="size-4 rounded-sm border-foreground/30 accent-foreground"
                />
                <span className="flex-1">{b.value}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{b.count}</span>
              </label>
            );
          })}
        </FilterGroup>

        <FilterGroup title="Category">
          {facets.categories.map((c) => {
            const checked = current.categories.includes(c.value);
            return (
              <label key={c.value} className="flex items-center gap-3 py-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    push({ categories: toggleInArray(current.categories, c.value) })
                  }
                  className="size-4 rounded-sm border-foreground/30 accent-foreground"
                />
                <span className="flex-1 capitalize">{c.value}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{c.count}</span>
              </label>
            );
          })}
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {formatPrice(facets.priceRange.min)} – {formatPrice(facets.priceRange.max)}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const min = priceMin === "" ? undefined : parseInt(priceMin, 10);
                const max = priceMax === "" ? undefined : parseInt(priceMax, 10);
                push({ minPrice: min, maxPrice: max });
              }}
            >
              <input
                type="number"
                inputMode="numeric"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder={`£${facets.priceRange.min}`}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                aria-label="Minimum price"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                inputMode="numeric"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder={`£${facets.priceRange.max}`}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                aria-label="Maximum price"
              />
              <button
                type="submit"
                className="rounded-full border border-foreground px-3 py-2 text-xs font-semibold"
              >
                Go
              </button>
            </form>
          </div>
        </FilterGroup>

        <FilterGroup title="Availability">
          <label className="flex items-center gap-3 py-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={current.inStock}
              onChange={(e) => push({ inStock: e.target.checked })}
              className="size-4 rounded-sm border-foreground/30 accent-foreground"
            />
            <span>In stock only</span>
          </label>
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/60">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const current = ((params.get("sort") as ShopSort | null) ?? "bestseller") as ShopSort;
  const [, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-3 text-sm">
      <span className="text-xs font-medium uppercase tracking-widest text-foreground/60">
        Sort
      </span>
      <select
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "bestseller") next.delete("sort");
          else next.set("sort", e.target.value);
          const qs = next.toString();
          startTransition(() => router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false }));
        }}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm cursor-pointer"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
