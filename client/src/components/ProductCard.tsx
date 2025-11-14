import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { ShoppingCart, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  range: string;
  maxSpeed: string;
  rating?: number;
  reviewCount?: number;
  onViewDetails?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  slug,
  name,
  brand,
  price,
  image,
  range,
  maxSpeed,
  rating,
  reviewCount,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  const [, setLocation] = useLocation();
  const isPopular = id === "2"; // Eleglide M2 is popular
  const discount = id === "3" ? 20 : null; // DYU has discount

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      setLocation(`/product/${slug}`);
    }
  };
  
  return (
    <Card 
      className="hover-elevate active-elevate-2 transition-all overflow-hidden cursor-pointer" 
      data-testid={`card-product-${id}`}
      onClick={handleViewDetails}
    >
      <div className="aspect-square bg-gradient-to-br from-muted to-accent/20 relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${id}`}
        />
        <Badge className="absolute top-3 left-3" variant="secondary" data-testid={`badge-brand-${id}`}>
          {brand}
        </Badge>
        {isPopular && (
          <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-orange-600">
            ⭐ Bestseller
          </Badge>
        )}
        {discount && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-red-600">
            Save £{discount}
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-2 mb-3" data-testid={`rating-${id}`}>
            <StarRating rating={rating} size="sm" />
            {reviewCount !== undefined && reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        )}
        <p className="text-3xl font-bold text-primary mb-4" data-testid={`text-price-${id}`}>
          £{price.toLocaleString()}
          {discount && (
            <span className="text-base text-muted-foreground line-through ml-2">
              £{(price + discount).toFixed(2)}
            </span>
          )}
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div data-testid={`text-range-${id}`}>
            <span className="font-medium text-foreground">Range:</span> {range}
          </div>
          <div data-testid={`text-speed-${id}`}>
            <span className="font-medium text-foreground">Speed:</span> {maxSpeed}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart();
              }
            }}
            data-testid={`button-add-cart-${id}`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            data-testid={`button-view-${id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
