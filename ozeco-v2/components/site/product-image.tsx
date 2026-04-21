import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

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
 * Thin wrapper over `next/image` with an explicit `isStudio` switch.
 * When set, applies `mix-blend-mode: multiply` — cheap, GPU-accelerated,
 * cross-browser. All other behaviour is identical to next/image.
 */
export function ProductImage({
  isStudio,
  style,
  alt,
  ...rest
}: ProductImageProps) {
  const merged: CSSProperties | undefined = isStudio
    ? { mixBlendMode: "multiply", ...style }
    : style;
  return <Image alt={alt} {...rest} style={merged} />;
}
