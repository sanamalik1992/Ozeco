import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import Reviews from "@/components/Reviews";
import StarRating from "@/components/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { ShoppingCart, Check, Zap, Battery, Gauge, Weight, MapPin, Shield, AlertCircle, User, ShieldCheck, Lock, RotateCcw } from "lucide-react";
import type { Product, Review } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const productSlug = params?.slug;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [mainCarouselApi, setMainCarouselApi] = useState<CarouselApi>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/slug/${productSlug}`],
    enabled: !!productSlug,
  });
  
  useEffect(() => {
    if (!mainCarouselApi) return;
    
    const handleSelect = () => {
      setSelectedImageIndex(mainCarouselApi.selectedScrollSnap());
    };
    
    mainCarouselApi.on('select', handleSelect);
    setSelectedImageIndex(mainCarouselApi.selectedScrollSnap());
    
    return () => {
      mainCarouselApi.off('select', handleSelect);
    };
  }, [mainCarouselApi]);
  
  useEffect(() => {
    setSelectedImageIndex(0);
    if (mainCarouselApi) {
      mainCarouselApi.scrollTo(0, true);
    }
  }, [product?.id, mainCarouselApi]);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/products/${product?.id}/reviews`],
    enabled: !!product?.id,
  });

  const { data: customerPhotos = [], isLoading: isLoadingPhotos } = useQuery<any[]>({
    queryKey: [`/api/customer-photos/product/${product?.id}`],
    enabled: !!product?.id,
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = async () => {
    if (product) {
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
    }
  };

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
    ...(product.riderHeight ? [{ icon: User, label: "Rider Height", value: product.riderHeight }] : []),
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Product Images Carousel */}
            <div className="space-y-4">
              {/* Main Image Carousel */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <Carousel 
                    setApi={setMainCarouselApi}
                    opts={{ loop: true }}
                  >
                    <CarouselContent>
                      {product.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={image}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full aspect-square object-contain p-8 bg-background rounded-lg"
                            data-testid={`img-product-${index}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="20" font-family="sans-serif">Image unavailable</text></svg>';
                            }}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {product.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" data-testid="button-carousel-main-prev" />
                        <CarouselNext className="right-2" data-testid="button-carousel-main-next" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-contain p-8 bg-background rounded-lg"
                    data-testid="img-product-main"
                  />
                )}
              </div>
              
              {/* Thumbnail Navigation */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        mainCarouselApi?.scrollTo(index);
                      }}
                      className={`
                        border-2 rounded-md overflow-hidden transition-all hover-elevate active-elevate-2
                        ${selectedImageIndex === index ? 'border-primary' : 'border-border'}
                      `}
                      data-testid={`button-thumbnail-${index}`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full aspect-square object-contain p-2 bg-background"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f3f4f6"/></svg>';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {product.isBestseller && (
                <Badge className="bg-orange-500 text-white">
                  ⭐ Bestseller
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BrandLogo brand={product.brand} />
                  <Badge variant="outline" data-testid="badge-category">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-4 text-primary" data-testid="dealer-badge">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold">Authorised UK Dealer</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-product-name">
                  {product.name}
                </h1>
                {reviews.length > 0 && (
                  <button
                    onClick={() => {
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="flex items-center gap-3 mb-4 hover-elevate active-elevate-2 p-2 -ml-2 rounded-md transition-colors"
                    data-testid="button-scroll-to-reviews"
                  >
                    <StarRating rating={averageRating} size="lg" />
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </button>
                )}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                      £{parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">Free UK Delivery</span>
                  </div>
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
                {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                  <div className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 px-4 py-3 rounded-md" data-testid="stock-urgency">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Only {product.stockQuantity} left in stock - Order soon!</span>
                  </div>
                )}
                <Button size="lg" className="w-full" onClick={handleAddToCart} data-testid="button-add-to-cart">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                  <div className="flex flex-col items-center gap-1">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground text-xs">12-Month Warranty</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground text-xs">14-Day Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Lock className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground text-xs">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground text-xs">Fast Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-12">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6">About This Electric Bike</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Performance</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The {product.name} is equipped with a {product.motorPower} motor that delivers reliable power 
                    for all your journeys. With a {product.batteryCapacity} battery, you can travel up to {product.maxRange} 
                    on a single charge, reaching speeds of up to {product.topSpeed}. Whether you're commuting to work, 
                    running errands, or exploring the countryside, this Electric bike offers the perfect balance of 
                    performance and efficiency.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Design & Build Quality</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built by {product.brand}, a trusted name in Electric bikes, the {product.name} combines quality 
                    engineering with thoughtful design. The {product.frameType} frame provides durability while 
                    maintaining a comfortable riding position. At {product.weight}, it strikes an ideal balance between 
                    sturdiness and portability, with a maximum load capacity of {product.maxLoad}.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Perfect For</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.category === "Electric Folding Bikes" && 
                      "Ideal for urban commuters who need a compact, portable solution. This folding Electric bike easily fits in your car boot, under your desk, or in storage at home. Perfect for mixed-mode commuting combining public transport and cycling."
                    }
                    {product.category === "Electric Mountain Bikes" && 
                      "Designed for adventurous riders who want to explore off-road trails and challenging terrain. This mountain Electric bike gives you the power to tackle steep hills and rough paths with confidence, extending your riding range and making every trail accessible."
                    }
                    {product.category === "Electric City Bikes" && 
                      "Perfect for daily commuters and casual riders navigating city streets. This Electric bike makes your daily journey effortless, helping you arrive fresh and on time while enjoying the freedom of two wheels."
                    }
                    {(product.category !== "Electric Folding Bikes" && 
                      product.category !== "Electric Mountain Bikes" && 
                      product.category !== "Electric City Bikes") && 
                      "This versatile Electric bike is suitable for a wide range of riders and purposes. Whether commuting, leisure riding, or running errands, it provides reliable electric assistance to make every journey more enjoyable and less tiring."
                    }
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Why Choose This Model?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Trusted Brand</p>
                        <p className="text-sm text-muted-foreground">{product.brand} is known for quality and reliability in the Electric bike market</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Fast UK Delivery</p>
                        <p className="text-sm text-muted-foreground">Dispatch within 1 working day, 2-3 working days delivery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">12-Month Warranty</p>
                        <p className="text-sm text-muted-foreground">Comprehensive warranty coverage for peace of mind</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Expert Support</p>
                        <p className="text-sm text-muted-foreground">UK-based customer service team ready to help</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Photos */}
          {isLoadingPhotos ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Customer Photos</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square w-1/4 flex-shrink-0 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : customerPhotos.length > 0 ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <span>Customer Photos ({customerPhotos.length})</span>
                  <a
                    href="/gallery"
                    className="text-sm text-primary hover:underline font-normal"
                    data-testid="link-view-all-photos"
                  >
                    View all photos in gallery →
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {customerPhotos.map((photo, index) => (
                      <CarouselItem 
                        key={photo.id} 
                        className="pl-2 md:pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                        data-testid={`customer-photo-${index}`}
                      >
                        <div className="group relative aspect-square overflow-hidden rounded-lg border hover-elevate active-elevate-2 cursor-pointer bg-muted">
                          <img
                            src={photo.imageUrl}
                            alt={`Customer photo by ${photo.customerName}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16" font-family="sans-serif">Image unavailable</text></svg>';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center">
                            <p className="text-xs font-semibold mb-1">{photo.customerName}</p>
                            {photo.caption && (
                              <p className="text-xs line-clamp-3">{photo.caption}</p>
                            )}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="!left-2 !bottom-4 !top-auto !translate-y-0 z-10" data-testid="button-carousel-prev" />
                  <CarouselNext className="!right-2 !bottom-4 !top-auto !translate-y-0 z-10" data-testid="button-carousel-next" />
                </Carousel>
              </CardContent>
            </Card>
          ) : null}

          {/* Reviews */}
          <div id="reviews" className="scroll-mt-20">
            <Reviews reviews={reviews} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
