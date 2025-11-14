import { useEffect, useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { SiPaypal, SiShopify } from "react-icons/si";

type PaymentMethod = 'stripe' | 'paypal';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        size="lg" 
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Complete Payment"
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { items, isLoading: cartLoading } = useCart();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stripePublicKey, setStripePublicKey] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<{
    stripe: boolean;
    paypal: boolean;
  } | null>(null);

  const stripePromise = useMemo(() => 
    stripePublicKey ? loadStripe(stripePublicKey) : null,
    [stripePublicKey]
  );

  // Calculate total using integer cents to avoid floating-point errors
  const totalInPence = items.reduce((sum, item) => {
    const priceInPence = Math.round(parseFloat(item.product.price) * 100);
    return sum + (priceInPence * item.quantity);
  }, 0);
  const totalPrice = totalInPence / 100;

  // Fetch payment configuration from backend on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/config/stripe-key", { credentials: "include" }).then(res => res.json()),
      fetch("/api/config/payment-methods", { credentials: "include" }).then(res => res.json())
    ])
      .then(([stripeData, paymentMethodsData]) => {
        setStripePublicKey(stripeData.publishableKey);
        setAvailablePaymentMethods(paymentMethodsData);
        
        // Auto-select first available payment method
        if (paymentMethodsData.stripe) {
          setPaymentMethod('stripe');
        } else if (paymentMethodsData.paypal) {
          setPaymentMethod('paypal');
        }
      })
      .catch((error) => {
        console.error("Error fetching payment config:", error);
      });
  }, []);

  useEffect(() => {
    if (cartLoading || stripePublicKey === null || availablePaymentMethods === null) {
      return;
    }

    if (items.length === 0) {
      setLocation("/cart");
      return;
    }

    if (!stripePublicKey || paymentMethod !== 'stripe') {
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent only for Stripe
    apiRequest("POST", "/api/create-payment-intent", {})
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setIsLoading(false);
      });
  }, [items, setLocation, cartLoading, stripePublicKey, paymentMethod, availablePaymentMethods]);

  if (cartLoading || availablePaymentMethods === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Redirecting to cart...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasAnyPaymentMethod = availablePaymentMethods.stripe || availablePaymentMethods.paypal;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8" data-testid="text-checkout-title">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3" data-testid={`checkout-item-${item.product.slug}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">£{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-primary font-semibold">FREE</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span data-testid="text-checkout-total">£{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {!hasAnyPaymentMethod ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Not Configured</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="font-semibold text-lg mb-2">Payment processing is not yet set up</p>
                      <p className="text-muted-foreground mb-4">
                        Please contact us to complete your order.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Email: <a href="mailto:support@ozeco.co.uk" className="text-primary underline">support@ozeco.co.uk</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Payment Method Selection - only show if multiple methods available */}
                  {availablePaymentMethods.stripe && availablePaymentMethods.paypal && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Choose Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                            className="h-20 flex flex-col gap-2"
                            onClick={() => setPaymentMethod('stripe')}
                            data-testid="button-payment-stripe"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              <span className="font-semibold">Card / Shop Pay</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-80">
                              <SiShopify className="w-4 h-4" />
                              <span>Includes Shop Pay</span>
                            </div>
                          </Button>
                          
                          <Button
                            type="button"
                            variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                            className="h-20 flex flex-col gap-2"
                            onClick={() => setPaymentMethod('paypal')}
                            data-testid="button-payment-paypal"
                          >
                            <div className="flex items-center gap-2">
                              <SiPaypal className="w-5 h-5" />
                              <span className="font-semibold">PayPal</span>
                            </div>
                            <span className="text-xs opacity-80">Fast & Secure</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {paymentMethod === 'stripe' ? 'Card Payment' : 'PayPal Payment'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {paymentMethod === 'stripe' ? (
                        <>
                          {!availablePaymentMethods.stripe ? (
                            <div className="text-center py-8">
                              <p className="font-semibold text-lg mb-2">Card payment not available</p>
                              <p className="text-muted-foreground">
                                Please use PayPal or contact support.
                              </p>
                            </div>
                          ) : isLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : clientSecret && stripePromise ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <CheckoutForm />
                            </Elements>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-destructive mb-2">Error loading payment form.</p>
                              <p className="text-sm text-muted-foreground">Please try again or contact support.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {!availablePaymentMethods.paypal ? (
                            <div className="text-center py-8">
                              <p className="font-semibold text-lg mb-2">PayPal not available</p>
                              <p className="text-muted-foreground">
                                Please use card payment or contact support.
                              </p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <p className="text-sm text-muted-foreground mb-4">
                                Click the PayPal button below to complete your purchase securely.
                              </p>
                              <PayPalButton
                                amount={totalPrice.toFixed(2)}
                                currency="GBP"
                                intent="CAPTURE"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <div className="text-xs text-muted-foreground text-center">
                    <p>🔒 Your payment information is encrypted and secure</p>
                    <p className="mt-1">Dispatch within 1 working day, shipping time is 2-3 working days</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
