import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/stock_images/person_riding_electr_6fefd866.jpg";

export default function Hero() {
  // Using a high-quality stock video of e-bike lifestyle
  // You can replace this URL with your own video file for best performance
  const videoUrl = "https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_25fps.mp4";
  
  return (
    <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
      {/* Autoplaying looping background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        poster={heroImage}
        data-testid="video-hero-background"
      >
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback to image if video doesn't load */}
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/65 z-5" />
      
      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <Badge className="mb-6 bg-red-600 text-white border-red-700 animate-pulse" data-testid="badge-uk-based">
          🔥 SALE: Save Up To £150 - Limited Time!
        </Badge>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight" data-testid="text-hero-title">
          UK's Fastest Growing
          <br />
          <span className="text-primary">Electric Bike Store</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white mb-4 max-w-3xl mx-auto font-semibold" data-testid="text-hero-subtitle">
          Premium Electric Bikes From £359.99
        </p>
        <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Dispatch within 1 working day • 2-3 day UK delivery • Free shipping • Expert support 7 days a week
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link href="/shop">
            <Button size="lg" variant="default" className="bg-primary hover:bg-primary border-primary-border text-lg px-8 py-6" data-testid="button-shop-now">
              Shop Black Friday Deals
            </Button>
          </Link>
          <Link href="/shop">
            <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm border-white/40 text-white hover:bg-background/30 text-lg px-8 py-6" data-testid="button-view-brands">
              Compare Bikes
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2" data-testid="trust-fast-dispatch">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>1 Day Dispatch</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-delivery-time">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>2-3 Day Delivery</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-warranty">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>12-Month Warranty</span>
          </div>
          <div className="flex items-center gap-2" data-testid="trust-expert-support">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>UK Support 7 Days</span>
          </div>
        </div>
      </div>
    </section>
  );
}
