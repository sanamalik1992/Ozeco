import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md",
  showNumber = false,
  className = ""
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);
        
        return (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
              isFilled 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground/30"
            }`}
            data-testid={`star-${index + 1}`}
          />
        );
      })}
      {showNumber && (
        <span className="text-sm font-medium ml-1" data-testid="rating-number">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
