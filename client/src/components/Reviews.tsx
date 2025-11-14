import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRating from "@/components/StarRating";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Review } from "@shared/schema";

interface ReviewsProps {
  reviews: Review[];
}

type SortOption = "recent" | "highest" | "lowest";

export default function Reviews({ reviews }: ReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Sort reviews based on selected option
  const sortedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    const sorted = [...reviews];
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  // Show only first 10 reviews unless "showAll" is true
  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 10);
  const hasMore = reviews.length > 10;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

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
        {/* Filter/Sort Controls */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">
            Showing {displayedReviews.length} of {reviews.length} reviews
          </span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]" data-testid="select-review-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent" data-testid="option-sort-recent">Most Recent</SelectItem>
              <SelectItem value="highest" data-testid="option-sort-highest">Highest Rated</SelectItem>
              <SelectItem value="lowest" data-testid="option-sort-lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        {displayedReviews.map((review) => (
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
            {review.comment && (
              <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                {review.comment}
              </p>
            )}
          </div>
        ))}

        {/* View More/Less Button */}
        {hasMore && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
              data-testid="button-toggle-reviews"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show Less Reviews
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View All {reviews.length} Reviews
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
