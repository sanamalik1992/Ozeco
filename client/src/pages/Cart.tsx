import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithPricing, ProductVariant } from "@shared/schema";

interface CartItemWithProduct {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  sessionId: string;
  createdAt: string;
  product: ProductWithPricing;
  variant?: ProductVariant | null;
}

export default function Cart() {
  const { toast } = useToast();
  
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.variant?.price || item.product.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-3" data-testid="text-empty-cart">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Start adding some Electric bikes to your cart!
              </p>
              <Link href="/shop">
                <Button size="lg" data-testid="button-shop-now">
                  Browse Electric Bikes
                </Button>
              </Link>
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
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-cart-title">
              Shopping Cart
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending}
              data-testid="button-clear-cart"
            >
              {clearCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24 lg:pb-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4" data-testid={`cart-item-${item.product.slug}`}>
                  <div className="flex gap-4">
                    <Link href={`/product/${item.product.slug}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md bg-muted hover-elevate cursor-pointer"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <div>
                          <Link href={`/product/${item.product.slug}`}>
                            <h3 className="font-semibold text-lg leading-tight hover:text-primary cursor-pointer">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemMutation.mutate(item.id)}
                          disabled={removeItemMutation.isPending}
                          data-testid={`button-remove-${item.product.slug}`}
                        >
                          {removeItemMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                id: item.id,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            data-testid={`button-decrease-${item.product.slug}`}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium" data-testid={`text-quantity-${item.product.slug}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantityMutation.mutate({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-increase-${item.product.slug}`}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold" data-testid={`text-price-${item.product.slug}`}>
                            £{(parseFloat(item.variant?.price || item.product.price) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            £{parseFloat(item.variant?.price || item.product.price).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary - Hidden on mobile, shown on desktop */}
            <div className="lg:col-span-1 hidden lg:block">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-display font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-primary">FREE</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span data-testid="text-cart-total">£{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full" size="lg" data-testid="button-checkout">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>Dispatch within 1 working day</strong>
                    <br />
                    Shipping time is 2-3 working days
                  </p>
                </div>

                <Link href="/shop">
                  <Button variant="outline" className="w-full mt-3" data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </Link>
              </Card>
            </div>
          </div>

          {/* Mobile Sticky Checkout Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total ({totalItems} {totalItems === 1 ? "item" : "items"})</p>
                  <p className="text-2xl font-bold" data-testid="text-mobile-total">£{subtotal.toFixed(2)}</p>
                </div>
                <Link href="/checkout" className="flex-1 ml-4">
                  <Button className="w-full" size="lg" data-testid="button-mobile-checkout">
                    Checkout
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Free delivery • Dispatch within 1 day
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
