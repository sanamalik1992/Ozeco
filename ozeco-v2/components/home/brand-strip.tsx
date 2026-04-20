import { getBrands } from "@/lib/db/queries";

export async function BrandStrip() {
  const brands = await getBrands();
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-paper-dim/40 py-14">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-20">
          {brands.map((brand) => (
            <span
              key={brand}
              className="font-display text-2xl font-bold tracking-tight text-muted-foreground/80 uppercase md:text-3xl"
              style={{ letterSpacing: "0.08em" }}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
