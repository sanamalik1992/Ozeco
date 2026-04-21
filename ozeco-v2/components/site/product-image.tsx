"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type CSSProperties } from "react";

export type ProductImageProps = ImageProps & {
  /**
   * Studio-shot product image on a pure-white background?
   *
   * Set to `true` to apply `mix-blend-mode: multiply` so the white studio
   * backdrop blends into the warm paper page background (#F4F2EF) instead
   * of rendering as a visible white rectangle.
   *
   * Opt-in ONLY for product studio shots (catalogue photography, hero
   * product detail crops, spec macros). Never set on:
   *   - Customer photos (lifestyle — multiply destroys them)
   *   - Blog covers / editorial photography
   *   - Brand logos on light backgrounds
   *   - Any photograph where the background is part of the subject
   */
  isStudio?: boolean;
};

/**
 * Thin wrapper over `next/image`. Adds:
 *   1. `isStudio` opt-in → applies `mix-blend-mode: multiply`.
 *   2. Graceful fallback when the underlying image fails to load (404,
 *      network error, etc). Renders an inline SVG placeholder in place of
 *      the broken image — no extra network fetch needed.
 *
 * Client component because `onError` needs an event handler. All other
 * behaviour is identical to next/image.
 */
export function ProductImage({
  isStudio,
  style,
  alt,
  className,
  onError,
  ...rest
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        role="img"
        aria-label={(alt as string) || "Image unavailable"}
        className={`flex h-full w-full items-center justify-center bg-paper-dim text-foreground/35 ${className ?? ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-1/3 max-h-16 w-auto"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="M21 15l-4.5-4.5a2 2 0 0 0-2.8 0L5 19" />
        </svg>
      </div>
    );
  }

  const merged: CSSProperties | undefined = isStudio
    ? { mixBlendMode: "multiply", ...style }
    : style;

  return (
    <Image
      alt={alt}
      {...rest}
      className={className}
      style={merged}
      onError={(e) => {
        setErrored(true);
        onError?.(e);
      }}
    />
  );
}
