import Link from "next/link";
import { getFeaturedReviews } from "@/lib/db/queries";
import { RatingStars } from "@/components/site/rating-stars";

export async function ReviewsSection() {
  const reviews = await getFeaturedReviews(5);
  if (reviews.length === 0) return null;

  const [pull, ...rest] = reviews;

  return (
    <section className="bg-ink text-paper py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-paper/60">
          What riders say
        </div>

        <figure className="mt-10 max-w-4xl">
          <blockquote className="font-display text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[56px]">
            <span aria-hidden>“</span>
            {pull.comment}
            <span aria-hidden>”</span>
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-3 text-sm text-paper/70">
            <RatingStars rating={pull.rating} size="sm" />
            <span>
              {pull.customerName} ·{" "}
              <Link
                href={`/product/${pull.productSlug}`}
                className="hover:text-paper transition-colors"
              >
                {pull.productName.replace(/ Electric Bike$/i, "")}
              </Link>
            </span>
          </figcaption>
        </figure>

        <div className="mt-20 grid grid-cols-1 gap-10 border-t border-paper/10 pt-14 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {rest.slice(0, 4).map((r) => (
            <figure key={r.id}>
              <RatingStars rating={r.rating} size="xs" />
              <p className="mt-3 text-sm leading-relaxed text-paper/90 line-clamp-5">
                {r.comment}
              </p>
              <figcaption className="mt-4 text-xs text-paper/60">
                {r.customerName} ·{" "}
                <Link
                  href={`/product/${r.productSlug}`}
                  className="hover:text-paper transition-colors"
                >
                  {r.productName.replace(/ Electric Bike$/i, "")}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsSectionSkeleton() {
  return (
    <div className="bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="h-3 w-24 rounded-full bg-paper/20" />
        <div className="mt-10 h-40 max-w-4xl rounded-xl bg-paper/10" />
      </div>
    </div>
  );
}
