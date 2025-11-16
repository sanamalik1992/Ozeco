import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Product, type Review } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/BrandLogo";
import StarRating from "@/components/StarRating";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Filter } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function Shop() {
  const search = useSearch();
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const { addItem } = useCart();
  const { toast } = useToast();

  // Update selected brand when URL param changes
  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const brandParam = searchParams.get('brand') || 'all';
    console.log('Search string:', search);
    console.log('Brand param:', brandParam);
    setSelectedBrand(brandParam);
  }, [search]);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create a stable product IDs list for dependencies
  const productIdsList = useMemo(() => products.map(p => p.id), [products]);

  // Fetch reviews for all products - using individual queries would be better but
  // for simplicity we aggregate them here with a stable key
  const { data: reviewsMap = {} } = useQuery<Record<string, Review[]>>({
    queryKey: ["all-reviews", ...productIdsList],
    queryFn: async () => {
      if (products.length === 0) return {};
      
      const reviewsData: Record<string, Review[]> = {};
      
      const results = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await fetch(`/api/products/${product.id}/reviews`, {
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              return { id: product.id, reviews: data };
            }
            return { id: product.id, reviews: [] };
          } catch (error) {
            return { id: product.id, reviews: [] };
          }
        })
      );
      
      results.forEach(({ id, reviews }) => {
        reviewsData[id] = reviews;
      });
      
      return reviewsData;
    },
    enabled: products.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Calculate average rating for a product
  const getProductRating = (productId: string): { rating: number; count: number } => {
    const reviews = reviewsMap[productId] || [];
    if (reviews.length === 0) return { rating: 0, count: 0 };
    
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return { rating: avgRating, count: reviews.length };
  };

  // Get unique brands and categories
  const brands = ["all", ...Array.from(new Set(products.map(p => p.brand)))];
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = products
    .filter(p => selectedBrand === "all" || p.brand === selectedBrand)
    .filter(p => selectedCategory === "all" || p.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        default: // featured - bestsellers first
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      }
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="flex-1 bg-gradient-to-b from-accent/20 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-shop-title">
            Shop All Electric Bikes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl" data-testid="text-shop-subtitle">
            Browse our complete range of premium Electric bikes from top UK brands
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              <span>Filter:</span>
            </div>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[180px]" data-testid="select-brand">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>
                    {brand === "all" ? "All Brands" : brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground" data-testid="text-product-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">Unable to load products. Please refresh the page.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No products found with the selected filters.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedBrand("all");
                  setSelectedCategory("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="group overflow-hidden hover-elevate" data-testid={`card-product-${product.slug}`}>
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                        data-testid={`img-product-${product.slug}`}
                      />
                      {product.isBestseller && (
                        <Badge className="absolute top-2 left-2 bg-orange-500 text-white" data-testid="badge-bestseller">
                          Bestseller
                        </Badge>
                      )}
                      {product.originalPrice && (
                        <Badge className="absolute top-2 right-2 bg-red-600 text-white" data-testid="badge-sale">
                          Save £{(parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <div className="mb-3">
                        <div className="mb-2">
                          <BrandLogo brand={product.brand} className="h-6" />
                        </div>
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors" data-testid={`text-name-${product.slug}`}>
                          {product.name}
                        </h3>
                      </div>
                      
                      {(() => {
                        const { rating, count } = getProductRating(product.id);
                        return rating > 0 && (
                          <div className="flex items-center gap-2 mb-3" data-testid={`rating-${product.slug}`}>
                            <StarRating rating={rating} size="sm" />
                            <span className="text-xs text-muted-foreground">({count})</span>
                          </div>
                        );
                      })()}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold" data-testid={`text-price-${product.slug}`}>
                          £{parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            £{parseFloat(product.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                        {product.maxRange && <span>🔋 {product.maxRange}</span>}
                        {product.topSpeed && <span>⚡ {product.topSpeed}</span>}
                      </div>
                    </Link>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Link href={`/product/${product.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full" data-testid={`button-view-${product.slug}`}>
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      size="icon" 
                      variant="default" 
                      className="bg-primary"
                      onClick={(e) => handleAddToCart(product, e)}
                      data-testid={`button-cart-${product.slug}`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
