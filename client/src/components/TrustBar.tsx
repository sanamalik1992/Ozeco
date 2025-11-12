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
    <div className="bg-muted/50 border-y py-3">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
