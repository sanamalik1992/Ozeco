import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  range: string;
  maxSpeed: string;
  onViewDetails?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  id,
  name,
  brand,
  price,
  image,
  range,
  maxSpeed,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 transition-all overflow-hidden" data-testid={`card-product-${id}`}>
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${id}`}
        />
        <Badge className="absolute top-3 left-3" data-testid={`badge-brand-${id}`}>
          {brand}
        </Badge>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-3xl font-bold text-primary mb-4" data-testid={`text-price-${id}`}>
          £{price.toLocaleString()}
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
            onClick={onAddToCart}
            data-testid={`button-add-cart-${id}`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onViewDetails}
            data-testid={`button-view-${id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
