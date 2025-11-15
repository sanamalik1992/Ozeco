import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Headphones, Award, Truck } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free UK Delivery",
    description: "Free shipping on all orders within the United Kingdom. Delivery in 3-6 business days.",
  },
  {
    icon: Award,
    title: "12-Month Warranty",
    description: "All e-bikes come with a comprehensive 12-month warranty for your peace of mind.",
  },
  {
    icon: Headphones,
    title: "UK-Based Support",
    description: "Expert customer service available Mon-Fri, 9:00 AM - 5:30 PM (GMT). Call 03333398590.",
  },
  {
    icon: MapPin,
    title: "UK Registered Company",
    description: "Ozeco Ltd (Company No: 15445991) established in 2022 and based in Mildenhall, UK.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-why-choose-title">
            Why Choose Ozeco?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-testid="text-why-choose-subtitle">
            Your trusted partner for premium Electric bikes in the UK
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} data-testid={`card-feature-${index}`}>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid={`text-feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm" data-testid={`text-feature-description-${index}`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
