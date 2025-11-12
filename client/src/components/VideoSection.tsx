import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

export default function VideoSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-video-title">
            Experience Electric Bikes in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our Electric bikes perform in real-world conditions. From city commutes to countryside adventures.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="text-center">
                  <div className="bg-primary/90 backdrop-blur-sm rounded-full p-6 mb-4 inline-block hover-elevate active-elevate-2 cursor-pointer" data-testid="button-video-play">
                    <Play className="h-12 w-12 text-primary-foreground fill-current" />
                  </div>
                  <p className="text-lg font-semibold">Watch Our Electric Bikes in Action</p>
                  <p className="text-sm text-muted-foreground mt-2">Customer reviews and product demonstrations</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">3-6 Days</div>
              <p className="text-sm text-muted-foreground">Free UK Delivery</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">12 Months</div>
              <p className="text-sm text-muted-foreground">Warranty Included</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">5 Brands</div>
              <p className="text-sm text-muted-foreground">Premium Selection</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
