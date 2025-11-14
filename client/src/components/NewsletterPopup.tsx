import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, X, Gift } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ebikePic from "@assets/stock_images/modern_electric_bike_67e355f5.jpg";

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    const hasSubscribed = localStorage.getItem("newsletter-subscribed");

    if (!hasSeenPopup && !hasSubscribed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("newsletter-popup-seen", "true");
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      const data = await response.json();

      if (response.ok) {
        setDiscountCode(data.discountCode);
        localStorage.setItem("newsletter-subscribed", "true");
        toast({
          title: "Success!",
          description: "Check your email for your £10 discount code.",
        });
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

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden" data-testid="dialog-newsletter">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity z-50 bg-background/80 backdrop-blur-sm p-1 rounded-full"
          data-testid="button-close-newsletter"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative h-48 md:h-auto overflow-hidden">
            <img 
              src={ebikePic} 
              alt="Electric bike" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background/80 to-transparent" />
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {!discountCode ? (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Get £10 Off Your First Order!</h2>
                  <p className="text-muted-foreground">
                    Join our newsletter and receive an exclusive £10 discount code for your first Electric bike purchase.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsletter-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="newsletter-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isSubmitting}
                        data-testid="input-newsletter-email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-newsletter-submit"
                  >
                    {isSubmitting ? "Subscribing..." : "Get My £10 Discount"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By subscribing, you agree to receive marketing emails from Ozeco. You can unsubscribe at any time.
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Ozeco!</h2>
                  <p className="text-muted-foreground">
                    Here's your exclusive discount code:
                  </p>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Your Discount Code</p>
                  <p className="text-3xl font-bold text-primary tracking-wider" data-testid="text-discount-code">
                    {discountCode}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Save £10 on your first order</p>
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full"
                  data-testid="button-start-shopping"
                >
                  Start Shopping
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  This code has been saved to your account. Check your email for details.
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
