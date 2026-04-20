import Image from "next/image";
import Link from "next/link";
import { getSpotlightProduct, getHeroProduct } from "@/lib/db/queries";
import { assetUrl, formatPrice } from "@/lib/assets";
import { ArrowRight } from "lucide-react";

export async function FeaturedSpotlight() {
  const hero = await getHeroProduct();
  const product = await getSpotlightProduct(hero?.id);
  if (!product) return null;

  const hasDiscount =
    product.originalPrice &&
    parseFloat(product.originalPrice) > parseFloat(product.displayPrice);

  return (
    <section className="bg-background py-24 md:py-40">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-12 md:gap-16 md:px-10">
        <div className="md:col-span-7">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-paper-dim md:aspect-[4/3]">
            <Image
              src={assetUrl(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Featured · {product.brand}
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[0.95] tracking-tighter text-balance sm:text-5xl md:text-[64px]">
            {product.name.replace(/ Electric Bike$/i, "")}
          </h2>
          <p className="mt-6 text-base text-muted-foreground text-pretty md:text-lg">
            {product.description.split(".").slice(0, 2).join(".") + "."}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border/60 py-8">
            <Spec label="Motor" value={product.motorPower} />
            <Spec label="Range" value={product.maxRange} />
            <Spec label="Top speed" value={product.topSpeed} />
            <Spec label="Battery" value={product.batteryCapacity} />
          </dl>

          <div className="mt-10 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">
              {formatPrice(product.displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-paper hover:bg-ink/90 transition-colors"
          >
            Discover
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-xl font-semibold">
        {value ?? "—"}
      </dd>
    </div>
  );
}

export function FeaturedSpotlightSkeleton() {
  return (
    <div className="bg-background py-24 md:py-40">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7 aspect-[4/3] rounded-2xl bg-paper-dim" />
        <div className="md:col-span-5 space-y-4">
          <div className="h-3 w-20 rounded-full bg-paper-dim" />
          <div className="h-12 w-3/4 rounded-lg bg-paper-dim" />
          <div className="h-12 w-2/3 rounded-lg bg-paper-dim" />
          <div className="h-20 w-full rounded-lg bg-paper-dim" />
        </div>
      </div>
    </div>
  );
}
