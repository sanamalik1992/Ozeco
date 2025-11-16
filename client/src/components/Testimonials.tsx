import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import customer1 from "@assets/stock_images/south_asian_indian_m_d9be52e1.jpg";
import customer2 from "@assets/stock_images/black_african_britis_8af0b20c.jpg";
import customer3 from "@assets/stock_images/muslim_woman_hijab_s_657b4732.jpg";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Manchester",
    image: customer1,
    rating: 5,
    text: "Bought the ENGWE Engine Pro 2.0 three months ago for my 12-mile commute. Battery still shows 70% after the full journey even in eco mode. The steep hills on my route used to kill me on my old bike - now they're effortless. Dispatched same day, arrived in perfect condition.",
  },
  {
    name: "Marcus Johnson",
    location: "Bristol",
    image: customer2,
    rating: 5,
    text: "The Eleglide M1 Plus has transformed my daily school run. I can fit two child seats and still get 45km range. No more sitting in traffic on the A4. Saved over £200 in petrol this month alone. The customer service team were brilliant when I had questions about the battery warranty.",
  },
  {
    name: "Fatima Hassan",
    location: "Edinburgh",
    image: customer3,
    rating: 5,
    text: "The DYU D3F folding bike is perfect for my daily routine. Folds in 15 seconds so I can take it on the bus to Portobello, then cycle along the prom. The compact design fits perfectly in my flat, and the throttle makes hills effortless. Absolutely brilliant purchase!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-testimonials-title">
            Loved by UK Riders
          </h2>
          <p className="text-muted-foreground text-lg" data-testid="text-testimonials-subtitle">
            Don't just take our word for it - see why thousands choose Ozeco for their Electric bike
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} data-testid={`card-testimonial-${index}`}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4" data-testid={`rating-${index}`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6" data-testid={`text-testimonial-${index}`}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold" data-testid={`text-customer-name-${index}`}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-customer-location-${index}`}>
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
