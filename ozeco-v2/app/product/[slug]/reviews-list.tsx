"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/lib/db/schema";
import { RatingStars } from "@/components/site/rating-stars";

const PER_PAGE = 8;

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(reviews.length / PER_PAGE));
  const slice = useMemo(() => reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE), [reviews, page]);

  if (reviews.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        No reviews yet.
      </p>
    );
  }

  return (
    <div>
      <ol className="space-y-8 divide-y divide-border/60">
        {slice.map((r) => (
          <li key={r.id} className="pt-8 first:pt-0">
            <div className="flex items-center gap-2">
              <RatingStars rating={r.rating} size="sm" />
              {r.verified && (
                <span className="rounded-full border border-foreground/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/80">
                  Verified purchase
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{r.comment}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {r.customerName} ·{" "}
              {new Date(r.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </li>
        ))}
      </ol>

      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm underline-offset-4 hover:underline disabled:opacity-30 disabled:no-underline"
          >
            ← Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="text-sm underline-offset-4 hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
