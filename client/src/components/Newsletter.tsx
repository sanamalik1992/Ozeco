import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter.",
    });
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-newsletter-title">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-6" data-testid="text-newsletter-description">
              Subscribe to our newsletter for exclusive deals, new arrivals, and e-bike tips delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-submit">
                Subscribe
              </Button>
            </form>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3" data-testid="text-company-story-title">
                Our Story
              </h3>
              <p className="text-muted-foreground mb-4">
                Founded in 2022 as ekwonline, we rebranded to Ozeco in 2023 with a mission to make premium electric bikes accessible to UK riders.
              </p>
              <p className="text-muted-foreground">
                As a family-run business based in the UK, we're passionate about sustainable transportation and helping our customers discover the joy of e-biking. We partner with leading brands like ENGWE, Eleglide, DYU, Duotts, and Touroll to bring you the best selection at competitive prices with expert support every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
