import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { Check } from "lucide-react";
import type { Review } from "@shared/schema";

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span>Customer Reviews</span>
          <div className="flex items-center gap-3">
            <StarRating rating={averageRating} size="lg" />
            <span className="text-lg text-muted-foreground">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0" data-testid={`review-${review.id}`}>
            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold" data-testid={`review-name-${review.id}`}>
                    {review.customerName}
                  </h4>
                  {review.verified && (
                    <Badge variant="outline" className="text-xs gap-1" data-testid={`review-verified-${review.id}`}>
                      <Check className="h-3 w-3" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <span className="text-sm text-muted-foreground" data-testid={`review-date-${review.id}`}>
                {new Date(review.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            {review.title && (
              <h5 className="font-semibold mb-2" data-testid={`review-title-${review.id}`}>
                {review.title}
              </h5>
            )}
            <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
              {review.comment}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
