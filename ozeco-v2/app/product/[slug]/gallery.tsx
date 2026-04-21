"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { assetUrl } from "@/lib/assets";
import { ProductImage } from "@/components/site/product-image";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const valid = images.filter(Boolean);
  const [active, setActive] = useState(0);

  // Mobile swipe carousel — desktop uses thumbnail-click model below.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onThumbClick = useCallback(
    (i: number) => {
      setActive(i);
      emblaApi?.scrollTo(i);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (valid.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-paper-dim flex items-center justify-center text-sm text-muted-foreground">
        No images
      </div>
    );
  }

  return (
    <div>
      {/* Main viewport — Embla on mobile for swipe, static on desktop */}
      <div
        className="relative overflow-hidden rounded-2xl bg-paper-dim md:pointer-events-auto"
        ref={emblaRef}
      >
        <div className="flex">
          {valid.map((img, i) => (
            <div
              key={img + i}
              className="relative aspect-square w-full flex-[0_0_100%]"
            >
              <ProductImage
                src={assetUrl(img)}
                alt={i === 0 ? name : ""}
                fill
                isStudio
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Mobile dot indicators */}
        {valid.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden">
            {valid.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30"
                }`}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop thumbnails */}
      {valid.length > 1 && (
        <div className="mt-4 hidden gap-3 overflow-x-auto no-scrollbar pb-1 md:flex">
          {valid.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => onThumbClick(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative size-20 shrink-0 overflow-hidden rounded-lg bg-paper-dim transition-all ${
                i === active
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <ProductImage
                src={assetUrl(img)}
                alt=""
                fill
                isStudio
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
