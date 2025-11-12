import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Headphones, Tag, Truck } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "UK Based Business",
    description: "Family-run company established in 2022, committed to serving UK customers.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Knowledgeable team ready to help you find the perfect e-bike for your needs.",
  },
  {
    icon: Tag,
    title: "Competitive Pricing",
    description: "Great value on premium brands with regular offers and finance options.",
  },
  {
    icon: Truck,
    title: "Fast UK Delivery",
    description: "Quick dispatch with free delivery on all e-bikes across Great Britain.",
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
            Your trusted partner for premium electric bikes in the UK
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
