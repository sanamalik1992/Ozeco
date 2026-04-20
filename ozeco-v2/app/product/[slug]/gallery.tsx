"use client";

import Image from "next/image";
import { useState } from "react";
import { assetUrl } from "@/lib/assets";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const valid = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const hero = valid[active] ?? valid[0];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-paper-dim">
        {hero && (
          <Image
            src={assetUrl(hero)}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
            className="object-cover"
          />
        )}
      </div>
      {valid.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {valid.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative size-20 shrink-0 overflow-hidden rounded-lg bg-paper-dim transition-all ${
                i === active
                  ? "ring-2 ring-ink ring-offset-2 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={assetUrl(img)}
                alt=""
                fill
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
