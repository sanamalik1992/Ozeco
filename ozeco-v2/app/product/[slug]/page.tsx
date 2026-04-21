import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldCheck, Headset } from "lucide-react";
import type { Metadata } from "next";
import {
  getCustomerPhotosForProduct,
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
  getVariantsForProduct,
} from "@/lib/db/queries";
import { assetUrl } from "@/lib/assets";
import { RatingStars } from "@/components/site/rating-stars";
import { ProductCard } from "@/components/site/product-card";
import { ProductImage } from "@/components/site/product-image";
import { ProductGallery } from "./gallery";
import { VariantSelector } from "./variant-selector";
import { ReviewsList } from "./reviews-list";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: assetUrl(product.image) }],
    },
  };
}

function firstParagraph(text: string, maxChars = 200): string {
  const firstSentenceEnd = /(?<=\.)\s+(?=[A-Z])/.exec(text);
  const cut = firstSentenceEnd ? text.slice(0, firstSentenceEnd.index + 1) : text;
  if (cut.length <= maxChars) return cut.trim();
  const trimmed = cut.slice(0, maxChars);
  const lastSpace = trimmed.lastIndexOf(" ");
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const shortDesc = firstParagraph(product.description);

  return (
    <>
      {/* Top — gallery + buy box */}
      <section className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-16">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>{" "}
          ·{" "}
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>{" "}
          · <span className="text-foreground/80">{product.brand}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-7">
            <ProductGallery name={product.name} images={images} />
          </div>
          <div className="md:col-span-5 md:pt-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {product.brand} · {product.category}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold leading-[0.95] tracking-tighter sm:text-4xl md:text-5xl text-balance">
              {product.name.replace(/ Electric Bike$/i, "")}
            </h1>

            <Suspense
              fallback={
                <div className="mt-6 h-4 w-32 animate-pulse rounded-full bg-paper-dim" />
              }
            >
              <InlineRatingSummary productId={product.id} />
            </Suspense>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              {shortDesc}
            </p>

            <div className="mt-8">
              <Suspense
                fallback={
                  <div className="h-40 w-full animate-pulse rounded-xl bg-paper-dim" />
                }
              >
                <VariantBlock
                  productId={product.id}
                  basePrice={product.displayPrice}
                  originalPrice={product.originalPrice}
                  baseInStock={product.inStock}
                />
              </Suspense>
            </div>

            <TrustIcons />

            <KeySpecsGrid
              motor={product.motorPower}
              battery={product.batteryCapacity}
              range={product.maxRange}
              speed={product.topSpeed}
            />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="border-t border-border/60 bg-paper-dim/40 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            About the {product.name.replace(/ Electric Bike$/i, "")}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90 md:text-lg">
            {product.description
              .split(/(?<=\.)\s+(?=[A-Z])/)
              .map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
          </div>
        </div>
      </section>

      {/* Full spec table */}
      <section className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Full specification
        </h2>
        <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2">
          <SpecRow label="Brand" value={product.brand} />
          <SpecRow label="Category" value={product.category} />
          <SpecRow label="Motor power" value={product.motorPower} />
          <SpecRow label="Battery capacity" value={product.batteryCapacity} />
          <SpecRow label="Max range" value={product.maxRange} />
          <SpecRow label="Top speed" value={product.topSpeed} />
          <SpecRow label="Weight" value={product.weight} />
          <SpecRow label="Max load" value={product.maxLoad} />
          <SpecRow label="Frame type" value={product.frameType} />
          <SpecRow label="Rider height" value={product.riderHeight} />
        </dl>

        {product.features.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-xl font-semibold tracking-tight">
              Features
            </h3>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 inline-block size-1.5 rounded-full bg-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What's in the box — section hidden entirely when array is empty */}
        {product.inTheBox && product.inTheBox.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-xl font-semibold tracking-tight">
              What&apos;s in the box
            </h3>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.inTheBox.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 inline-block size-1.5 rounded-full bg-foreground/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="border-y border-border/60 bg-paper-dim/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Reviews
          </h2>
          <Suspense
            fallback={
              <div className="mt-8 h-64 w-full animate-pulse rounded-xl bg-paper-dim" />
            }
          >
            <ReviewsBlock productId={product.id} />
          </Suspense>
        </div>
      </section>

      {/* Customer photos — filtered to approved=true in the query */}
      <Suspense fallback={null}>
        <CustomerPhotosStrip
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
        />
      </Suspense>

      {/* Related */}
      <Suspense fallback={null}>
        <RelatedRow
          productId={product.id}
          brand={product.brand}
          category={product.category}
        />
      </Suspense>
    </>
  );
}

async function VariantBlock({
  productId,
  basePrice,
  originalPrice,
  baseInStock,
}: {
  productId: string;
  basePrice: string;
  originalPrice: string | null;
  baseInStock: boolean;
}) {
  const variants = await getVariantsForProduct(productId);
  return (
    <VariantSelector
      basePrice={basePrice}
      originalPrice={originalPrice}
      baseInStock={baseInStock}
      variants={variants}
    />
  );
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/60 py-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground text-right">{value}</dd>
    </div>
  );
}

function KeySpecsGrid({
  motor,
  battery,
  range,
  speed,
}: {
  motor?: string | null;
  battery?: string | null;
  range?: string | null;
  speed?: string | null;
}) {
  return (
    <dl className="mt-10 grid grid-cols-2 gap-4 border-y border-border/60 py-6">
      {[
        { label: "Motor", value: motor },
        { label: "Battery", value: battery },
        { label: "Range", value: range },
        { label: "Top speed", value: speed },
      ].map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 font-display text-lg font-semibold">
            {value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TrustIcons() {
  return (
    <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-[11px] font-medium text-muted-foreground">
      {[
        { icon: Truck, label: "Free UK delivery" },
        { icon: ShieldCheck, label: "2-year warranty" },
        { icon: Headset, label: "Expert support" },
      ].map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center gap-2 rounded-lg border border-border/60 px-2 py-4">
          <Icon className="size-5 text-foreground" strokeWidth={1.5} />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

async function InlineRatingSummary({ productId }: { productId: string }) {
  const { average, total } = await getReviewsForProduct(productId);
  if (total === 0) return null;
  return (
    <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
      <RatingStars rating={average} size="sm" />
      <span>
        {average.toFixed(1)} · {total} review{total === 1 ? "" : "s"}
      </span>
    </div>
  );
}

async function ReviewsBlock({ productId }: { productId: string }) {
  const { items, total, average, breakdown } =
    await getReviewsForProduct(productId);

  if (total === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  const max = Math.max(...Object.values(breakdown), 1);

  return (
    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl font-bold tabular-nums">
            {average.toFixed(1)}
          </span>
          <div>
            <RatingStars rating={average} size="md" />
            <div className="mt-1 text-xs text-muted-foreground">
              Based on {total.toLocaleString("en-GB")} reviews
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star as 1 | 2 | 3 | 4 | 5] ?? 0;
            const pct = Math.round((count / max) * 100);
            return (
              <div
                key={star}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-xs text-muted-foreground"
              >
                <span className="w-4 text-right font-medium text-foreground">
                  {star}
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-paper-dim">
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums">
                  {count.toLocaleString("en-GB")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-8">
        <ReviewsList reviews={items} />
      </div>
    </div>
  );
}

async function CustomerPhotosStrip({
  productId,
  productSlug,
  productName,
}: {
  productId: string;
  productSlug: string;
  productName: string;
}) {
  const photos = await getCustomerPhotosForProduct(productId, 6);
  if (photos.length === 0) return null;

  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              From our riders
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tighter sm:text-4xl">
              {productName.replace(/ Electric Bike$/i, "")} out in the wild
            </h2>
          </div>
          <Link
            href={`/gallery?product=${productSlug}`}
            className="hidden self-end text-sm font-semibold underline-offset-4 hover:underline md:inline-block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-paper-dim"
            >
              <ProductImage
                src={assetUrl(p.imageUrl)}
                alt={p.caption ?? p.customerName}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function RelatedRow({
  productId,
  brand,
  category,
}: {
  productId: string;
  brand: string;
  category: string;
}) {
  const related = await getRelatedProducts(productId, brand, category, 3);
  if (related.length === 0) return null;
  return (
    <section className="border-t border-border/60 bg-paper-dim/40 py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl">
          You may also like
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
