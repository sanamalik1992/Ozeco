import Image from "next/image";
import Link from "next/link";
import type { ProductWithPricing } from "@/lib/db/schema";
import { assetUrl, formatPrice } from "@/lib/assets";

export function ProductCard({
  product,
  priority = false,
  className = "",
}: {
  product: ProductWithPricing;
  priority?: boolean;
  className?: string;
}) {
  const hero = assetUrl(product.image);
  const hasDiscount =
    product.originalPrice &&
    parseFloat(product.originalPrice) > parseFloat(product.displayPrice);
  const firstFeature = product.features?.[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group block ${className}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-paper-dim hover-lift">
        {hero ? (
          <Image
            src={hero}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1280px) 33vw, 380px"
            priority={priority}
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {product.isBestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-paper">
            Bestseller
          </span>
        )}
        {!product.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {product.brand}
        </div>
        <h3 className="font-display text-lg font-semibold leading-tight text-balance">
          {product.name.replace(/ Electric Bike$/i, "")}
        </h3>
        {firstFeature && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {firstFeature}
          </p>
        )}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-display text-lg font-semibold">
            {formatPrice(product.displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
