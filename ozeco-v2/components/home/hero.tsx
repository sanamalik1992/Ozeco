import Image from "next/image";
import Link from "next/link";
import { getHeroProduct } from "@/lib/db/queries";
import { assetUrl } from "@/lib/assets";
import { ArrowRight } from "lucide-react";

export async function Hero() {
  const product = await getHeroProduct();
  if (!product) return null;

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-ink text-paper">
      <Image
        src={assetUrl(product.image)}
        alt={product.name}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
        <div className="max-w-3xl">
          <div className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-paper/70">
            {product.brand} · {product.category}
          </div>
          <h1 className="font-display text-[56px] font-black leading-[0.95] tracking-tighter text-balance sm:text-[80px] md:text-[108px]">
            {product.name.replace(/ Electric Bike$/i, "")}
          </h1>
          <p className="mt-6 max-w-xl text-base text-paper/80 text-pretty md:text-lg">
            {product.description.split(".")[0]}.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/product/${product.slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-paper/90"
            >
              Shop now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-7 py-4 text-sm font-semibold text-paper hover:bg-paper/10 transition-colors"
            >
              View full range
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return <div className="h-[85vh] min-h-[600px] w-full bg-paper-dim" aria-hidden />;
}
