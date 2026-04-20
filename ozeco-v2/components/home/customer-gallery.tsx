import Image from "next/image";
import Link from "next/link";
import { getApprovedCustomerPhotos } from "@/lib/db/queries";
import { assetUrl } from "@/lib/assets";

export async function CustomerGallery() {
  const photos = await getApprovedCustomerPhotos(12);
  if (photos.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              From our riders
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-[56px] text-balance">
              Built for real streets.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden shrink-0 self-end text-sm font-semibold hover:text-accent transition-colors md:inline-flex"
          >
            See the full gallery →
          </Link>
        </div>

        <div className="mt-12 masonry">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/product/${photo.productSlug}`}
              className="group block overflow-hidden rounded-xl bg-paper-dim"
            >
              <div className="relative">
                <Image
                  src={assetUrl(photo.imageUrl)}
                  alt={photo.caption ?? `${photo.customerName} on their ${photo.productName}`}
                  width={600}
                  height={800}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-auto w-full object-cover transition-transform duration-[500ms] ease-out group-hover:scale-[1.03]"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="text-xs font-medium text-paper">
                    {photo.customerName}
                  </div>
                  <div className="text-[11px] text-paper/70">
                    {photo.productName.replace(/ Electric Bike$/i, "")}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomerGallerySkeleton() {
  return (
    <div className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="h-10 w-2/3 rounded-lg bg-paper-dim" />
        <div className="mt-12 masonry">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-paper-dim rounded-xl"
              style={{ height: 200 + ((i * 37) % 180) }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
