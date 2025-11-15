import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";

export default function FeaturedProducts() {
  const { data: allProducts = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  const { addItem } = useCart();
  const { toast } = useToast();

  // Filter for bestsellers and sort with Eleglide M2 first
  const products = allProducts
    .filter(p => p.isBestseller)
    .sort((a, b) => {
      // Put Eleglide M2 first
      if (a.slug === 'eleglide-m2') return -1;
      if (b.slug === 'eleglide-m2') return 1;
      return 0;
    })
    .slice(0, 4);

  const handleAddToCart = (product: Product) => {
    addItem(product.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || products.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {isError ? "Unable to load products. Please try again later." : "No featured products available at the moment."}
            </p>
            <Link href="/shop">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-primary text-primary-foreground">Top Sellers</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-featured-title">
              Most Popular Electric Bikes
            </h2>
            <p className="text-muted-foreground text-lg" data-testid="text-featured-subtitle">
              Trusted by thousands of UK riders • Starting from £359.99
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="hidden md:flex" data-testid="button-view-all">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              name={product.name}
              brand={product.brand}
              price={parseFloat(product.price)}
              image={product.image}
              range={product.maxRange || ""}
              maxSpeed={product.topSpeed || ""}
              stockQuantity={product.stockQuantity}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" data-testid="button-view-all-mobile">
              View All E-Bikes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
