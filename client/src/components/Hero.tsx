import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/UK_countryside_e-bike_rider_0d6d6fed.png";

export default function Hero() {
  return (
    <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <Badge className="mb-6 bg-orange-500 text-white border-orange-600" data-testid="badge-uk-based">
          🎉 Free UK Delivery on All Orders
        </Badge>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6" data-testid="text-hero-title">
          Ride Further. Save More.
          <br />
          <span className="text-primary">Go Electric.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
          Premium Electric bikes from £359.99. Join 400,000+ riders who've made the switch.
          <br />
          <span className="font-semibold text-white">UK-based support • 12-month warranty • 3-6 day delivery</span>
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary border-primary-border" data-testid="button-shop-now">
            Shop Now
          </Button>
          <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm border-white/40 text-white hover:bg-background/30" data-testid="button-view-brands">
            View Brands
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2" data-testid="trust-free-delivery">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>Free UK Delivery</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-expert-support">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>UK-Based Support</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-warranty">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>12-Month Warranty</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-delivery-time">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>3-6 Day Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
