import { useEffect, useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShippingForm, { type ShippingFormData } from "@/components/ShippingForm";
import ApplePayButton from "@/components/ApplePayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, ArrowLeft, Check, Lock, Tag, X } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { SiPaypal, SiShopify, SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import TrustBadges from "@/components/TrustBadges";

type PaymentMethod = 'stripe' | 'paypal';
type CheckoutStep = 'shipping' | 'payment';

function CheckoutForm({ shippingData, clientSecret, totalPrice, orderId }: { shippingData: ShippingFormData; clientSecret: string; totalPrice: number; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe or elements not loaded");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Attempting to confirm payment...");
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
          receipt_email: shippingData.customerEmail,
        },
      });

      if (error) {
        console.error("Stripe payment error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "A processing error occurred",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Unexpected error during payment:", err);
      toast({
        title: "Payment Failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ApplePayButton 
        shippingData={shippingData} 
        totalAmount={totalPrice} 
        clientSecret={clientSecret}
        orderId={orderId}
      />
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
    </div>
  );
}

export default function Checkout() {
  const { items, isLoading: cartLoading, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripePublicKey, setStripePublicKey] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<{
    stripe: boolean;
    paypal: boolean;
  } | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  const stripePromise = useMemo(() => 
    stripePublicKey ? loadStripe(stripePublicKey) : null,
    [stripePublicKey]
  );

  // Calculate total using integer cents to avoid floating-point errors
  // Use variant price if available, otherwise use product price
  const totalInPence = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    const priceInPence = Math.round(parseFloat(price) * 100);
    return sum + (priceInPence * item.quantity);
  }, 0);
  const subtotal = totalInPence / 100;
  const discount = appliedDiscount?.amount || 0;
  const totalPrice = Math.max(subtotal - discount, 0);

  // Validate and apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingCode(true);
    try {
      const response = await apiRequest("POST", "/api/validate-discount", {
        code: discountCode.trim().toUpperCase(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Invalid Code",
          description: error.error || "This discount code is not valid",
          variant: "destructive",
        });
        setIsValidatingCode(false);
        return;
      }

      const data = await response.json();
      setAppliedDiscount({
        code: data.code,
        amount: data.discountAmount,
      });
      
      toast({
        title: "Discount Applied!",
        description: `£${data.discountAmount.toFixed(2)} discount applied to your order`,
      });
      setIsValidatingCode(false);
    } catch (error: any) {
      console.error("Error validating discount code:", error);
      toast({
        title: "Error",
        description: "Failed to validate discount code",
        variant: "destructive",
      });
      setIsValidatingCode(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    toast({
      title: "Discount Removed",
      description: "The discount code has been removed from your order",
    });
  };

  // Fetch payment configuration from backend on mount
  useEffect(() => {
    console.log("Fetching payment configuration...");
    Promise.all([
      fetch("/api/config/stripe-key", { credentials: "include" }).then(res => res.json()),
      fetch("/api/config/payment-methods", { credentials: "include" }).then(res => res.json())
    ])
      .then(([stripeData, paymentMethodsData]) => {
        console.log("Payment config received:", { 
          hasStripeKey: !!stripeData.publishableKey,
          paymentMethods: paymentMethodsData 
        });
        setStripePublicKey(stripeData.publishableKey);
        setAvailablePaymentMethods(paymentMethodsData);
        
        // Auto-select first available payment method
        if (paymentMethodsData.stripe) {
          setPaymentMethod('stripe');
        } else if (paymentMethodsData.paypal) {
          setPaymentMethod('paypal');
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching payment config:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (cartLoading) {
      return;
    }

    if (items.length === 0) {
      setLocation("/cart");
      return;
    }
  }, [items, setLocation, cartLoading]);

  const handleShippingSubmit = async (data: ShippingFormData) => {
    setShippingData(data);
    
    // Save shipping data to session
    try {
      await apiRequest("POST", "/api/checkout/shipping", data);
      setCurrentStep('payment');
      
      // Create PaymentIntent for Stripe if selected
      if (paymentMethod === 'stripe' && stripePublicKey) {
        console.log("Creating payment intent...");
        // SECURITY: Only send discount CODE, server validates and computes amount
        apiRequest("POST", "/api/create-payment-intent", {
          discountCode: appliedDiscount?.code || null,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Payment intent created successfully, orderId:", data.orderId);
            setClientSecret(data.clientSecret);
            setOrderId(data.orderId);
          })
          .catch((error) => {
            console.error("Error creating payment intent:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to initialise payment",
              variant: "destructive",
            });
          });
      }
    } catch (error: any) {
      console.error("Error saving shipping info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save shipping information",
        variant: "destructive",
      });
    }
  };

  const handlePayPalSuccess = async (orderID: string) => {
    try {
      await apiRequest("POST", "/api/orders/complete", {
        paypalOrderId: orderID,
        paymentMethod: 'paypal',
      });
      
      await clearCart();
      toast({
        title: "Order Complete!",
        description: "Your order has been placed successfully",
      });
      setLocation("/order-confirmation");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    }
  };

  if (cartLoading || isLoading || availablePaymentMethods === null) {
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
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-checkout-title">
            Checkout
          </h1>
          
          <TrustBadges variant="checkout" />
          
          {/* Payment Security */}
          <div className="flex flex-col items-center gap-3 pb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <SiVisa className="h-8 w-8" />
              <SiMastercard className="h-8 w-8" />
              <SiAmericanexpress className="h-8 w-8" />
              <SiPaypal className="h-8 w-8" />
              <SiShopify className="h-8 w-8" />
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${currentStep === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-primary text-primary-foreground' : shippingData ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {shippingData ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
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
                        <p className="text-sm font-medium">£{(parseFloat(item.variant?.price || item.product.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  {/* Promo Code Section */}
                  {!appliedDiscount ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Tag className="h-4 w-4 text-primary" />
                        <span>Have a promo code?</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyDiscount();
                            }
                          }}
                          disabled={isValidatingCode}
                          data-testid="input-promo-code"
                          className="uppercase"
                        />
                        <Button
                          onClick={handleApplyDiscount}
                          disabled={isValidatingCode || !discountCode.trim()}
                          size="default"
                          data-testid="button-apply-code"
                        >
                          {isValidatingCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">{appliedDiscount.code}</p>
                            <p className="text-xs text-muted-foreground">Discount applied</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveDiscount}
                          data-testid="button-remove-code"
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>-£{discount.toFixed(2)}</span>
                      </div>
                    )}
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

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      <Check className="inline w-3 h-3 mr-1" />
                      Dispatch within 1 working day
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shipping time is 2-3 working days
                    </p>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 'shipping' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ShippingForm onSubmit={handleShippingSubmit} defaultValues={shippingData || undefined}>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        data-testid="button-continue-payment"
                      >
                        Continue to Payment
                      </Button>
                    </ShippingForm>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep('shipping')}
                    className="mb-4"
                    data-testid="button-back-shipping"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipping
                  </Button>

                  {/* Shipping Summary */}
                  {shippingData && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Shipping Address</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep('shipping')}
                            data-testid="button-edit-shipping"
                          >
                            Edit
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{shippingData.customerName}</p>
                          <p>{shippingData.customerEmail}</p>
                          {shippingData.customerPhone && <p>{shippingData.customerPhone}</p>}
                          <p className="mt-2">{shippingData.shippingAddressLine1}</p>
                          {shippingData.shippingAddressLine2 && <p>{shippingData.shippingAddressLine2}</p>}
                          <p>{shippingData.shippingCity}, {shippingData.shippingPostalCode}</p>
                          <p>{shippingData.shippingCountry}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                      {/* Payment Method Selection */}
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
                                  <CreditCard className="h-5 w-5" />
                                  <span className="font-semibold">Card Payment</span>
                                </div>
                                <span className="text-xs flex items-center gap-1">
                                  <SiShopify className="h-3 w-3" />
                                  Includes Shop Pay
                                </span>
                              </Button>

                              <Button
                                type="button"
                                variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                                className="h-20 flex flex-col gap-2"
                                onClick={() => setPaymentMethod('paypal')}
                                data-testid="button-payment-paypal"
                              >
                                <div className="flex items-center gap-2">
                                  <SiPaypal className="h-5 w-5" />
                                  <span className="font-semibold">PayPal</span>
                                </div>
                                <span className="text-xs">Fast & Secure</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Payment Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {paymentMethod === 'stripe' && availablePaymentMethods.stripe && clientSecret && stripePromise ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <CheckoutForm shippingData={shippingData!} clientSecret={clientSecret} totalPrice={totalPrice} orderId={orderId!} />
                            </Elements>
                          ) : paymentMethod === 'paypal' && availablePaymentMethods.paypal ? (
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Click the PayPal button below to complete your purchase securely.
                              </p>
                              <PayPalButton
                                amount={totalPrice.toFixed(2)}
                                currency="GBP"
                                intent="CAPTURE"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
