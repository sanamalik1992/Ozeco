import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

interface CartContextType {
  items: CartItemWithProduct[];
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: items = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) => {
      const payload: any = { productId, quantity };
      if (variantId) payload.variantId = variantId;
      return apiRequest("POST", "/api/cart", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      return apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const addItem = async (productId: string, quantity = 1, variantId?: string) => {
    await addItemMutation.mutateAsync({ productId, quantity, variantId });
  };

  const removeItem = async (cartItemId: string) => {
    await removeItemMutation.mutateAsync(cartItemId);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    await updateQuantityMutation.mutateAsync({ cartItemId, quantity });
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total using integer pence to avoid floating-point errors
  // Use variant price if available, otherwise use product price
  const totalInPence = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price;
    const priceInPence = Math.round(parseFloat(price) * 100);
    return sum + (priceInPence * item.quantity);
  }, 0);
  const totalPrice = totalInPence / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
