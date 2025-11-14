import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, X, Gift } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
      <DialogContent className="sm:max-w-md" data-testid="dialog-newsletter">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          data-testid="button-close-newsletter"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {!discountCode ? (
          <>
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl text-center">Get £10 Off Your First Order!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Join our newsletter and receive an exclusive £10 discount code for your first Electric bike purchase.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl text-center">Welcome to Ozeco!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Here's your exclusive discount code:
              </DialogDescription>
            </DialogHeader>

            <div className="bg-primary/10 p-6 rounded-lg text-center my-4">
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

            <p className="text-xs text-muted-foreground text-center">
              This code has been saved to your account. Check your email for details.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
