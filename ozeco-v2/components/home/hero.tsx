import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/db/queries";
import { assetUrl } from "@/lib/assets";
import { ArrowRight } from "lucide-react";

// TODO: make admin-configurable in Phase 4
const HERO_SLUG = "touroll-u1";
const HERO_LABEL = "TOUROLL U1";

// TODO: confirm final copy with user
const HEADLINE = ["Power.", "Freedom.", "Everyday."] as const;
const TAGLINE = "Your adventure. Your way.";

export async function Hero() {
  const product = await getProductBySlug(HERO_SLUG);
  if (!product) {
    console.warn(
      `[hero] product with slug "${HERO_SLUG}" not found — hero will not render`
    );
    return null;
  }

  const hero = product.images?.[0] ?? product.image;
  const stripImages = (product.images ?? []).slice(1, 5);
  if (stripImages.length < 4) {
    console.warn(
      `[hero] only ${stripImages.length}/4 gallery images on "${HERO_SLUG}" — strip will be partial`
    );
  }

  return (
    <section className="bg-background">
      {/* Top: copy + product shot. ~45/55 on desktop; stacked on mobile. */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-6 py-16 md:min-h-[72dvh] md:grid-cols-[45fr_55fr] md:gap-8 md:px-12 md:py-20">
        <div className="order-1 md:order-1">
          <div className="text-[13px] font-medium uppercase tracking-[0.22em] text-foreground/70">
            {HERO_LABEL}
          </div>

          <h1 className="mt-6 font-display text-[40px] font-black leading-[1.05] tracking-tight text-foreground md:mt-8 md:text-[64px] lg:text-[72px]">
            {HEADLINE.map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted-foreground md:mt-8 md:text-lg">
            {TAGLINE}
          </p>

          <Link
            href={`/product/${HERO_SLUG}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-7 py-4 text-sm font-semibold text-background transition-colors hover:bg-background hover:text-foreground md:mt-10"
          >
            Shop now
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="order-2 md:order-2">
          <div className="relative mx-auto aspect-[3/2] w-full max-w-[780px]">
            {hero && (
              <Image
                src={assetUrl(hero)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 92vw, 55vw"
                priority
                className="object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Below: full-viewport-width 4-image gallery strip. 8px gaps, equal heights. */}
      {stripImages.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
          {stripImages.map((src, i) => (
            <div
              key={src + i}
              className="relative aspect-[4/3] overflow-hidden bg-paper-dim"
            >
              <Image
                src={assetUrl(src)}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="bg-background">
      <div
        aria-hidden
        className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-16 md:min-h-[72dvh] md:grid-cols-[45fr_55fr] md:gap-8 md:px-12 md:py-20"
      >
        <div>
          <div className="h-3 w-32 rounded-full bg-paper-dim" />
          <div className="mt-8 h-[40px] w-40 rounded-lg bg-paper-dim md:h-[64px] md:w-56 lg:h-[72px]" />
          <div className="mt-4 h-[40px] w-48 rounded-lg bg-paper-dim md:h-[64px] md:w-64 lg:h-[72px]" />
          <div className="mt-4 h-[40px] w-44 rounded-lg bg-paper-dim md:h-[64px] md:w-60 lg:h-[72px]" />
          <div className="mt-8 h-4 w-56 rounded-full bg-paper-dim" />
          <div className="mt-10 h-12 w-32 rounded-full bg-paper-dim" />
        </div>
        <div className="aspect-[3/2] w-full max-w-[780px] rounded-lg bg-paper-dim" />
      </div>
      <div className="grid w-full grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] bg-paper-dim" />
        ))}
      </div>
    </section>
  );
}
