import { Shield, Truck, Award, Lock } from "lucide-react";

interface TrustBadgesProps {
  variant?: "hero" | "checkout";
}

export default function TrustBadges({ variant = "hero" }: TrustBadgesProps) {
  const badges = [
    {
      icon: Award,
      text: variant === "hero" ? "Rated 4.9/5 Stars" : "4.9/5 Rating",
      subtext: "2,000+ Reviews",
    },
    {
      icon: Truck,
      text: variant === "hero" ? "Free UK Delivery" : "Free Delivery",
      subtext: "1-Day Dispatch",
    },
    {
      icon: Shield,
      text: variant === "hero" ? "UK Warranty Included" : "UK Warranty",
      subtext: "1-2 Year Coverage",
    },
    {
      icon: Lock,
      text: "Secure Checkout",
      subtext: "256-bit SSL",
    },
  ];

  if (variant === "checkout") {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-6" data-testid="trust-badges-checkout">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2"
            data-testid={`badge-${index}`}
          >
            <badge.icon className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <div className="font-semibold">{badge.text}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8" data-testid="trust-badges-hero">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 text-center hover-elevate"
          data-testid={`badge-${index}`}
        >
          <badge.icon className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold text-sm mb-1">{badge.text}</div>
          <div className="text-xs text-muted-foreground">{badge.subtext}</div>
        </div>
      ))}
    </div>
  );
}
