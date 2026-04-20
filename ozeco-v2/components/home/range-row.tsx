import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/lib/db/queries";
import { ProductCard } from "@/components/site/product-card";

export async function RangeRow() {
  const products = await getAllProducts();
  if (products.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              The range
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-[56px] text-balance">
              Every bike we sell, in one place.
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-2 self-end text-sm font-semibold hover:text-accent transition-colors md:inline-flex"
          >
            Browse all {products.length}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 overflow-x-auto no-scrollbar">
        <div className="flex gap-5 px-6 md:px-10 snap-x snap-mandatory">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="w-[75vw] shrink-0 snap-start sm:w-[340px] md:w-[380px]"
            >
              <ProductCard product={product} priority={i < 3} />
            </div>
          ))}
          {/* trailing spacer so last card isn't flush-right */}
          <div className="w-6 shrink-0 md:w-10" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export function RangeRowSkeleton() {
  return (
    <div className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="h-4 w-24 bg-paper-dim rounded-full" />
        <div className="h-10 w-2/3 bg-paper-dim rounded-lg mt-4" />
      </div>
      <div className="mt-12 flex gap-5 px-6 md:px-10 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[75vw] shrink-0 sm:w-[340px] md:w-[380px]">
            <div className="aspect-square rounded-xl bg-paper-dim" />
            <div className="h-3 w-20 rounded-full bg-paper-dim mt-4" />
            <div className="h-5 w-3/4 rounded-lg bg-paper-dim mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
