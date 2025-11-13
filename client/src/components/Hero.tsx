import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Play } from "lucide-react";
import { useState } from "react";
import heroImage from "@assets/stock_images/person_riding_electr_9ed610ff.jpg";

export default function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  
  return (
    <section className="relative h-[80vh] md:h-screen flex items-center justify-center overflow-hidden">
      {!showVideo ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
            data-testid="img-hero-background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => setShowVideo(true)}
              className="bg-primary/90 backdrop-blur-sm rounded-full p-8 hover-elevate active-elevate-2 transition-all group"
              data-testid="button-hero-play-video"
              aria-label="Play video"
            >
              <Play className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground fill-current group-hover:scale-110 transition-transform" />
            </button>
            <p className="text-white text-center mt-4 text-sm md:text-base font-semibold">Watch Our Story</p>
          </div>
        </>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full z-30"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          title="Ozeco Electric Bikes - See Them In Action"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid="video-hero-player"
        ></iframe>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 pointer-events-none" />
      
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
