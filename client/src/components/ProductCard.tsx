import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import CompareButton from "@/components/CompareButton";
import FavoriteButton from "@/components/FavoriteButton";
import { ShoppingCart, Eye, AlertCircle, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  displayPrice?: number; // The price to actually display (lowest variant price or base price)
  lowestVariantPrice?: number | null;
  image: string;
  range: string;
  maxSpeed: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  inStock?: boolean;
  onViewDetails?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  slug,
  name,
  brand,
  price,
  originalPrice,
  displayPrice,
  lowestVariantPrice,
  image,
  range,
  maxSpeed,
  rating,
  reviewCount,
  stockQuantity,
  inStock = true,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  const [, setLocation] = useLocation();
  const isPopular = id === "2"; // Eleglide M2 is popular
  const hasDiscount = originalPrice && originalPrice > price;
  const isOutOfStock = !inStock || (stockQuantity !== undefined && stockQuantity === 0);
  const showStockUrgency = !isOutOfStock && stockQuantity !== undefined && stockQuantity > 0 && stockQuantity < 10;
  
  // Use displayPrice if provided, otherwise fall back to price
  const priceToShow = displayPrice !== undefined ? displayPrice : price;
  const hasVariants = lowestVariantPrice !== null && lowestVariantPrice !== undefined;

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
          className="w-full h-full object-contain p-4"
          loading="lazy"
          data-testid={`img-product-${id}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="200" y="200" text-anchor="middle" dominant-baseline="middle" fill="%239ca3af" font-size="80" font-family="sans-serif"%3E%F0%9F%9A%B2%3C/text%3E%3C/svg%3E';
          }}
        />
        <Badge className="absolute top-3 left-3" variant="secondary" data-testid={`badge-brand-${id}`}>
          {brand}
        </Badge>
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton productId={id} productName={name} variant="icon" />
          </div>
          {isOutOfStock && (
            <Badge className="bg-red-600 text-white border-red-700" data-testid={`badge-out-of-stock-${id}`}>
              Sold Out
            </Badge>
          )}
          {!isOutOfStock && isPopular && (
            <Badge className="bg-orange-500 text-white border-orange-600">
              Bestseller
            </Badge>
          )}
          {!isOutOfStock && hasDiscount && originalPrice && (
            <Badge className="bg-red-500 text-white border-red-600">
              Save £{(originalPrice - price).toFixed(0)}
            </Badge>
          )}
        </div>
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
        <div className="mb-4">
          <p className="text-3xl font-bold text-primary" data-testid={`text-price-${id}`}>
            {hasVariants && <span className="text-xl font-normal text-muted-foreground">From </span>}
            £{priceToShow.toLocaleString()}
            {hasDiscount && originalPrice && (
              <span className="text-base text-muted-foreground line-through ml-2">
                £{originalPrice.toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div data-testid={`text-range-${id}`}>
            <span className="font-medium text-foreground">Range:</span> {range}
          </div>
          <div data-testid={`text-speed-${id}`}>
            <span className="font-medium text-foreground">Speed:</span> {maxSpeed}
          </div>
        </div>
        {showStockUrgency && (
          <div className="mb-3 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400" data-testid={`stock-urgency-${id}`}>
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Only {stockQuantity} left in stock!</span>
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <Button
            variant={isOutOfStock ? "secondary" : "default"}
            className="flex-1"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart && !isOutOfStock) {
                onAddToCart();
              }
            }}
            data-testid={`button-add-cart-${id}`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
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
        <div onClick={(e) => e.stopPropagation()}>
          <CompareButton productId={id} productName={name} />
        </div>
      </CardContent>
    </Card>
  );
}
