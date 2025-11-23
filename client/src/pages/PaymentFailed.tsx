import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, Mail } from "lucide-react";
import { Link } from "wouter";

export default function PaymentFailed() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-payment-failed-title">
                Payment Not Completed
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Your payment was not processed. Your order has not been placed and no charges have been made to your account.
              </p>

              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-4">What happened?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Your payment may have been declined by your bank</li>
                  <li>• The payment session may have timed out</li>
                  <li>• There may have been a technical issue during processing</li>
                  <li>• Payment details may have been incorrect</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  What you can do next
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>✓ Try placing your order again with the same or different payment method</li>
                  <li>✓ Check your bank balance and card details are correct</li>
                  <li>✓ Contact your bank if you believe the payment should have gone through</li>
                  <li>✓ Reach out to our support team if you need assistance</li>
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:support@ozeco.co.uk" className="text-primary hover:underline">
                      support@ozeco.co.uk
                    </a>
                  </div>
                  <span className="hidden sm:inline text-muted-foreground">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <a href="tel:03333398590" className="text-primary hover:underline">
                      03333 398590
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setLocation("/checkout")}
                  data-testid="button-retry-payment"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Link href="/shop">
                  <Button variant="outline" size="lg" data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" data-testid="button-home">
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
