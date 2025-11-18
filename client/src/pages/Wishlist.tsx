import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Favorite, Product } from "@shared/schema";

type FavoriteWithProduct = Favorite & { product: Product };

export default function Wishlist() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery<FavoriteWithProduct[]>({
    queryKey: ["/api/favorites"],
  });

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id);
      toast({
        title: "Added to cart",
        description: `${product.name}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" data-testid="heading-wishlist">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
                <p className="text-muted-foreground mb-6">
                  Save your favorite Electric bikes to quickly find them later
                </p>
                <Link href="/shop">
                  <Button size="lg" data-testid="button-shop">
                    Browse Electric Bikes
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map(({ product }) => (
                <Card key={product.id} className="hover-elevate overflow-hidden group">
                  <CardContent className="p-0">
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full aspect-square object-contain bg-muted p-6"
                        />
                        {product.isBestseller && (
                          <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
                            Bestseller
                          </Badge>
                        )}
                        {!product.inStock && (
                          <Badge className="absolute top-4 right-4 bg-destructive text-white">
                            Out of Stock
                          </Badge>
                        )}
                        {product.inStock && product.stockQuantity < 10 && (
                          <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                            Only {product.stockQuantity} left!
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <div className="p-4 space-y-3">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {product.brand}
                        </Badge>
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          £{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            £{product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1"
                          disabled={!product.inStock}
                          data-testid={`button-add-cart-${product.slug}`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Link href={`/product/${product.slug}`}>
                          <Button variant="outline" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
