import { Star } from "lucide-react";

export function RatingStars({
  rating,
  size = "sm",
  showNumber = false,
}: {
  rating: number;
  size?: "xs" | "sm" | "md" | "lg";
  showNumber?: boolean;
}) {
  const sizeClass = {
    xs: "size-3",
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }[size];
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-label={`${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i <= rounded ? "fill-ink text-ink" : "fill-transparent text-ink/30"
            }`}
            strokeWidth={1.5}
          />
        ))}
      </span>
      {showNumber && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
