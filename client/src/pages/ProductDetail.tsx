import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check, Zap, Battery, Gauge, Weight, MapPin, Shield } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">Sorry, we couldn't find the product you're looking for.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { icon: Zap, label: "Motor", value: product.motorPower },
    { icon: Battery, label: "Battery", value: product.batteryCapacity },
    { icon: Gauge, label: "Max Speed", value: product.topSpeed },
    { icon: MapPin, label: "Range", value: product.maxRange },
    { icon: Weight, label: "Weight", value: product.weight },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Product Image */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-contain bg-muted p-8"
                    data-testid="img-product-main"
                  />
                </CardContent>
              </Card>
              {product.isBestseller && (
                <Badge className="bg-orange-500 text-white">
                  ⭐ Bestseller
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" data-testid="badge-brand">
                    {product.brand}
                  </Badge>
                  <Badge variant="outline" data-testid="badge-category">
                    {product.category}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-product-name">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                    £{parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">Free UK Delivery</span>
                </div>
              </div>

              <Separator />

              {/* Key Features */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>
                <div className="space-y-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2" data-testid={`feature-${index}`}>
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Specifications */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="grid grid-cols-1 gap-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3" data-testid={`spec-${index}`}>
                      <div className="bg-primary/10 p-2 rounded-md">
                        <spec.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">{spec.label}</span>
                      </div>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button size="lg" className="w-full" data-testid="button-add-to-cart">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="flex flex-col items-center gap-1">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">12-Month Warranty</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Fast Dispatch</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">UK Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-12">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">About This Electric Bike</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-4">Delivery & Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Fast Dispatch</h3>
                  <p className="text-sm text-muted-foreground">
                    All orders are dispatched within 1 working day for quick delivery to your door.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">UK Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Free delivery across the UK. Your Electric bike will arrive in 2-3 working days.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Expert Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Our UK-based team is here to help 7 days a week with any questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
