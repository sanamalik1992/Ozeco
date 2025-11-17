import { useEffect, useState } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { ShippingFormData } from './ShippingForm';

interface ApplePayButtonProps {
  shippingData: ShippingFormData;
  totalAmount: number;
  clientSecret: string;
}

export default function ApplePayButton({ shippingData, totalAmount, clientSecret }: ApplePayButtonProps) {
  const stripe = useStripe();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const amountInPence = Math.round(totalAmount * 100);

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: 'Ozeco.co.uk',
        amount: amountInPence,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          toast({
            title: 'Payment Failed',
            description: confirmError.message,
            variant: 'destructive',
          });
        } else {
          ev.complete('success');
          
          await apiRequest("POST", "/api/orders/complete", {
            paymentIntentId: clientSecret.split('_secret_')[0],
            paymentMethod: 'stripe',
          });
          
          await clearCart();
          toast({
            title: 'Order Placed!',
            description: 'Your order has been successfully placed.',
          });
          setLocation('/order-confirmation');
        }
      } catch (error: any) {
        ev.complete('fail');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment',
          variant: 'destructive',
        });
      }
    });
  }, [stripe, totalAmount, shippingData, clearCart, toast, setLocation, clientSecret]);

  if (!paymentRequest) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Express Checkout</span>
        </div>
      </div>
      <PaymentRequestButtonElement 
        options={{ 
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '48px',
            },
          },
        }} 
      />
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or pay with card</span>
        </div>
      </div>
    </div>
  );
}
