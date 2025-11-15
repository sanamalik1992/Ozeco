import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, User } from "lucide-react";
import type { CustomerPhoto, Product } from "@shared/schema";

type CustomerPhotoWithProduct = CustomerPhoto & { product: Product };

export default function Gallery() {
  const { data: photos = [], isLoading } = useQuery<CustomerPhotoWithProduct[]>({
    queryKey: ["/api/customer-photos"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-muted rounded-lg"></div>
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
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" data-testid="heading-gallery">
              <Camera className="h-8 w-8 text-primary" />
              Customer Gallery
            </h1>
            <p className="text-muted-foreground">
              See how our customers enjoy their Electric bikes
            </p>
          </div>

          {photos.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No Photos Yet</h2>
                <p className="text-muted-foreground">
                  Be the first to share your Electric bike experience!
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card key={photo.id} className="hover-elevate overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption || `Photo by ${photo.customerName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-semibold text-sm">
                            {photo.customerName}
                          </span>
                        </div>
                        {photo.caption && (
                          <p className="text-sm opacity-90 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <Link href={`/product/${photo.product.slug}`}>
                        <div className="flex items-center justify-between hover-elevate rounded-lg p-2 -m-2">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {photo.product.brand}
                            </Badge>
                            <p className="font-semibold text-sm">
                              {photo.product.name}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            £{photo.product.price}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Card className="p-8 bg-primary/5">
              <h3 className="text-2xl font-bold mb-3">Share Your Adventure!</h3>
              <p className="text-muted-foreground mb-6">
                Got an Electric bike from Ozeco? We'd love to see how you're enjoying it!
              </p>
              <p className="text-sm text-muted-foreground">
                Tag us on Instagram{" "}
                <a
                  href="https://www.instagram.com/ozeco.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  @ozeco.co.uk
                </a>{" "}
                or send your photos to{" "}
                <a
                  href="mailto:support@ozeco.co.uk"
                  className="text-primary font-semibold hover:underline"
                >
                  support@ozeco.co.uk
                </a>
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
