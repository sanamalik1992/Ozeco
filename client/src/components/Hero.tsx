import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@assets/stock_images/person_riding_electr_063f5152.jpg";

export default function Hero() {
  // REPLACE 'YOUR_VIDEO_ID' with your actual YouTube video ID
  // Example: if your video URL is https://www.youtube.com/watch?v=ABC123, use 'ABC123'
  const videoId = "YOUR_VIDEO_ID";
  
  return (
    <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
      {/* Autoplaying looping background video */}
      <iframe
        className="absolute inset-0 w-full h-full z-0"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
        title="Ozeco Electric Bikes - Hero Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        data-testid="video-hero-background"
      ></iframe>
      
      {/* Fallback poster image (shows while video loads) */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
        data-testid="img-hero-poster"
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-5" />
      
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
          Join 400,000+ riders worldwide • Free UK delivery • Expert support 7 days a week
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button size="lg" variant="default" className="bg-primary hover:bg-primary border-primary-border text-lg px-8 py-6" data-testid="button-shop-now">
            Shop Black Friday Deals
          </Button>
          <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur-sm border-white/40 text-white hover:bg-background/30 text-lg px-8 py-6" data-testid="button-view-brands">
            Compare Bikes
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
