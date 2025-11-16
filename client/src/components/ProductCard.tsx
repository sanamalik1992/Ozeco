import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import CompareButton from "@/components/CompareButton";
import { ShoppingCart, Eye, AlertCircle, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  range: string;
  maxSpeed: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
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
  image,
  range,
  maxSpeed,
  rating,
  reviewCount,
  stockQuantity,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  const [, setLocation] = useLocation();
  const isPopular = id === "2"; // Eleglide M2 is popular
  const hasDiscount = originalPrice && originalPrice > price;
  const showStockUrgency = stockQuantity !== undefined && stockQuantity > 0 && stockQuantity < 10;

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
        {hasDiscount && originalPrice && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-red-600">
            Save £{(originalPrice - price).toFixed(0)}
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
          {hasDiscount && originalPrice && (
            <span className="text-base text-muted-foreground line-through ml-2">
              £{originalPrice.toLocaleString()}
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
        {showStockUrgency && (
          <div className="mb-3 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400" data-testid={`stock-urgency-${id}`}>
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Only {stockQuantity} left in stock!</span>
          </div>
        )}
        <div className="mb-3 flex items-center gap-2 text-sm text-primary" data-testid={`dealer-badge-${id}`}>
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium">Authorised UK Dealer</span>
        </div>
        <div className="flex gap-2 mb-2">
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
        <div onClick={(e) => e.stopPropagation()}>
          <CompareButton productId={id} productName={name} />
        </div>
      </CardContent>
    </Card>
  );
}
