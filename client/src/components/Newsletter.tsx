import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Gift } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      const data = await response.json();

      if (response.ok) {
        setDiscountCode(data.discountCode);
        toast({
          title: "Success!",
          description: `You've been subscribed! Your discount code is: ${data.discountCode}`,
        });
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to subscribe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-newsletter-title">
                Get £10 Off!
              </h2>
            </div>
            <p className="text-muted-foreground mb-6" data-testid="text-newsletter-description">
              Subscribe to our newsletter and receive an exclusive £10 discount code for your first Electric bike purchase, plus exclusive deals and e-bike tips.
            </p>
            {!discountCode ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  data-testid="input-newsletter-email"
                />
                <Button type="submit" disabled={isSubmitting} data-testid="button-newsletter-submit">
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            ) : (
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your Discount Code</p>
                <p className="text-2xl font-bold text-primary tracking-wider" data-testid="text-discount-code">
                  {discountCode}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Save £10 on your first order!</p>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-3" data-testid="text-company-story-title">
                Our Story
              </h3>
              <p className="text-muted-foreground mb-4">
                Founded in 2022, Ozeco has a mission to make premium Electric bikes accessible to UK riders.
              </p>
              <p className="text-muted-foreground">
                As a family-run business based in the UK, we're passionate about sustainable transportation and helping our customers discover the joy of Electric biking. We partner with leading brands like ENGWE, Eleglide, DYU, Duotts, and Touroll to bring you the best selection at competitive prices with expert support every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
