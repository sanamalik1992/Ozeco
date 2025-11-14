import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function OrderConfirmation() {
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeOrder = async () => {
      try {
        // Check if this is a Stripe return with payment_intent parameter
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntentId = urlParams.get('payment_intent');
        const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

        if (paymentIntentId && paymentIntentClientSecret) {
          // Complete the Stripe order
          await apiRequest("POST", "/api/orders/complete", {
            stripePaymentIntentId: paymentIntentId,
            paymentMethod: 'stripe',
          });
        }

        // Clear the cart
        await clearCart();
        setIsProcessing(false);
      } catch (error: any) {
        console.error("Order completion error:", error);
        setError("There was an issue processing your order. Please contact support.");
        toast({
          title: "Order Processing Error",
          description: "Please contact support to verify your order status.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };

    completeOrder();
  }, [clearCart, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Processing your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <h1 className="text-2xl font-display font-bold mb-4">Order Processing Issue</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="space-y-2 text-sm">
                  <p>Email: <a href="mailto:support@ozeco.co.uk" className="text-primary underline">support@ozeco.co.uk</a></p>
                </div>
                <Link href="/" className="mt-6 inline-block">
                  <Button>Back to Home</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-confirmation-title">
                Order Confirmed!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for your purchase. We've received your order and will begin processing it right away.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Fast Dispatch</h3>
                    <p className="text-sm text-muted-foreground">
                      Your order will be dispatched within 1 working day
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">UK Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Expect delivery in 2-3 working days across the UK
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ You'll receive an email confirmation shortly</li>
                  <li>✓ We'll send you tracking information once dispatched</li>
                  <li>✓ Your Electric bike will arrive ready to ride</li>
                  <li>✓ Contact us anytime if you have questions</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop">
                  <Button variant="outline" data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/">
                  <Button data-testid="button-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
