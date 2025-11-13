import { Shield, Truck, Award, Headset, Star } from "lucide-react";

const trustSignals = [
  {
    icon: Truck,
    text: "Free UK Delivery on All Orders",
  },
  {
    icon: Award,
    text: "12-Month Warranty Included",
  },
  {
    icon: Shield,
    text: "Secure Checkout",
  },
  {
    icon: Headset,
    text: "UK-Based Customer Support",
  },
];

export default function TrustBar() {
  return (
    <div className="bg-muted/50 border-y">
      <div className="container mx-auto px-4">
        {/* Trustpilot Section */}
        <div className="py-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Excellent</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-green-500 text-green-500" data-testid={`star-${star}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Based on <span className="font-semibold text-foreground">1,247 reviews</span> on</span>
              <span className="font-bold text-green-600">Trustpilot</span>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3">
          {trustSignals.map((signal, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 text-sm"
              data-testid={`trust-signal-${index}`}
            >
              <signal.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
