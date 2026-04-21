import Link from "next/link";
import { getProductBySlug } from "@/lib/db/queries";
import { ProductImage } from "@/components/site/product-image";

// TODO: make admin-configurable in Phase 4
const HERO_SLUG = "touroll-u1";
const HERO_LABEL = "TOUROLL U1";

// TODO: confirm final copy with user
const TAGLINE = "Your adventure. Your way.";

// TODO Phase 4: move these image assignments to admin-configurable hero settings.
// `isStudio: true` applies mix-blend-mode multiply so the pure-white backdrop
// blends into the warm paper page background. Studio shots only — the lifestyle
// slot (rider at the lake) stays plain so real photography isn't destroyed.
const HERO_IMAGES = {
  main: { src: "/hero/touroll-u1-hero.jpeg", isStudio: true },
  strip: [
    { src: "/hero/touroll-u1-battery.jpeg", isStudio: true },
    { src: "/hero/touroll-u1-drivetrain.jpeg", isStudio: true },
    { src: "/hero/touroll-u1-handlebar.jpeg", isStudio: true },
    { src: "/hero/touroll-u1-lifestyle.jpeg", isStudio: false },
  ],
} as const;

export async function Hero() {
  const product = await getProductBySlug(HERO_SLUG);
  if (!product) {
    console.warn(
      `[hero] product with slug "${HERO_SLUG}" not found — hero will not render`
    );
    return null;
  }

  return (
    <section className="bg-background">
      {/* One continuous canvas on #F4F2EF — no split, no panel, no divider. */}
      <div className="relative min-h-[72dvh] overflow-hidden md:min-h-[74dvh]">
        {/* Copy — upper-left quadrant. 10vw left gutter + 120px top on desktop. */}
        <div className="relative z-10 px-6 pt-12 pb-4 md:max-w-[42vw] md:pl-[10vw] md:pr-0 md:pt-[120px] md:pb-0">
          <div className="text-[14px] font-medium uppercase tracking-[0.22em] text-foreground/60 md:text-[15px]">
            {HERO_LABEL}
          </div>

          {/* Three-line staccato headline — explicit <br/> guarantees one word per line. */}
          <h1 className="mt-7 font-display text-[48px] font-black leading-[1.0] tracking-tight text-foreground md:mt-8 md:text-[88px]">
            Power.
            <br />
            Freedom.
            <br />
            Everyday.
          </h1>

          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
            {TAGLINE}
          </p>

          <Link
            href={`/product/${HERO_SLUG}`}
            className="mt-5 inline-block text-[17px] text-foreground underline underline-offset-4 decoration-1 transition-[text-decoration] hover:decoration-2 md:text-lg"
          >
            Shop now →
          </Link>
        </div>

        {/* Bike — dominant, right side, bottom-anchored.
            Mobile: stacks below copy. Desktop: absolute, 64vw wide, more vertical
            room than before (top 5%, bottom 0) so the bike has breathing space
            above the handlebars. object-position: center bottom pins the bike
            to the floor of its box regardless of container height. */}
        <div className="relative mt-2 aspect-[5/3] w-full px-6 md:absolute md:right-0 md:top-[5%] md:bottom-0 md:mt-0 md:aspect-auto md:w-[64vw] md:px-0">
          <ProductImage
            src={HERO_IMAGES.main.src}
            alt={product.name}
            fill
            isStudio={HERO_IMAGES.main.isStudio}
            priority
            sizes="(max-width: 768px) 92vw, 64vw"
            className="object-contain"
            style={{
              objectPosition: "center bottom",
              filter: "drop-shadow(0 40px 36px rgba(14, 15, 13, 0.22))",
            }}
          />
        </div>
      </div>

      {/* Strip — immediately below the hero, no vertical gap, full-bleed 100vw,
          4 equal 25vw cells, no gaps, edge-to-edge. object-cover everywhere.
          Lifestyle shot (slot 4) gets a slight upward object-position so the
          rider's head isn't cropped off when the cell is taller than its image. */}
      <div className="grid w-full grid-cols-4 gap-0">
        {HERO_IMAGES.strip.map(({ src, isStudio }) => {
          const isLifestyle = !isStudio;
          return (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden bg-paper-dim"
            >
              <ProductImage
                src={src}
                alt=""
                fill
                isStudio={isStudio}
                sizes="25vw"
                className="object-cover"
                style={isLifestyle ? { objectPosition: "50% 35%" } : undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="bg-background">
      <div
        aria-hidden
        className="relative min-h-[72dvh] overflow-hidden md:min-h-[74dvh]"
      >
        <div className="relative z-10 px-6 pt-12 pb-4 md:max-w-[42vw] md:pl-[10vw] md:pt-[120px]">
          <div className="h-3 w-28 rounded-full bg-paper-dim" />
          <div className="mt-8 h-[48px] w-44 rounded-lg bg-paper-dim md:h-[88px] md:w-64" />
          <div className="mt-2 h-[48px] w-52 rounded-lg bg-paper-dim md:h-[88px] md:w-72" />
          <div className="mt-2 h-[48px] w-48 rounded-lg bg-paper-dim md:h-[88px] md:w-64" />
          <div className="mt-6 h-4 w-56 rounded-full bg-paper-dim" />
          <div className="mt-6 h-4 w-28 rounded-full bg-paper-dim" />
        </div>
      </div>
      <div className="grid w-full grid-cols-4 gap-0">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] bg-paper-dim" />
        ))}
      </div>
    </section>
  );
}
