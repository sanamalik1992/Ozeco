import { Shield, Truck, Award, Headset } from "lucide-react";

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
        {/* Trust Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {trustSignals.map((signal, index) => (
            <div
              key={index}
              className="flex items-start justify-start md:items-center md:justify-center gap-2 text-sm text-left md:text-center"
              data-testid={`trust-signal-${index}`}
            >
              <signal.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground leading-snug">{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
