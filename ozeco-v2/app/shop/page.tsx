import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getShopFacets, getShopProducts } from "@/lib/db/shop-queries";
import { ProductCard } from "@/components/site/product-card";
import { FiltersSidebar, SortDropdown } from "./_components/filters-sidebar";
import { parseShopParams } from "./_lib/search-params";

export const metadata: Metadata = {
  title: "Shop",
  description: "Every electric bike we stock. Free UK delivery on every order.",
};

export const revalidate = 300;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const facets = await getShopFacets();
  const { filters, sort } = parseShopParams(resolvedParams, facets.priceRange);
  const products = await getShopProducts(filters, sort);

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16">
      <header className="mb-10 md:mb-14">
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          The range
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-6xl">
          All bikes
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {facets.totalProducts} bike{facets.totalProducts === 1 ? "" : "s"} in the current catalogue. Every
          order ships free across the UK.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr] md:gap-12 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={null}>
          <FiltersSidebar facets={facets} />
        </Suspense>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4 md:mb-10">
            <div className="text-sm text-muted-foreground">
              {products.length === 0
                ? "No bikes match"
                : `Showing ${products.length} of ${facets.totalProducts}`}
            </div>
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
              <p className="font-display text-2xl font-semibold">No bikes match these filters.</p>
              <Link
                href="/shop"
                className="mt-6 inline-block text-sm underline underline-offset-4 decoration-1 hover:decoration-2"
              >
                Clear filters →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
