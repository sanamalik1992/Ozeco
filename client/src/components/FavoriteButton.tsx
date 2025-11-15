import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  variant?: "default" | "icon";
}

export default function FavoriteButton({ productId, productName, variant = "icon" }: FavoriteButtonProps) {
  const { toast } = useToast();

  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/check/${productId}`],
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (currentlyFavorited: boolean) => {
      if (currentlyFavorited) {
        return apiRequest("DELETE", `/api/favorites/${productId}`);
      } else {
        return apiRequest("POST", "/api/favorites", { productId });
      }
    },
    onSuccess: (_, wasFavorited) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${productId}`] });
      
      // Use the mutation variable to determine correct toast message
      const isNowFavorited = !wasFavorited;
      toast({
        title: isNowFavorited ? "Added to wishlist" : "Removed from wishlist",
        description: isNowFavorited 
          ? `${productName} has been added to your wishlist.`
          : `${productName} has been removed from your wishlist.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Pass the current state to the mutation
    toggleFavoriteMutation.mutate(favoriteStatus?.isFavorite || false);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={toggleFavoriteMutation.isPending}
        className={favoriteStatus?.isFavorite ? "text-red-500" : ""}
        data-testid={`button-favorite-${productId}`}
      >
        <Heart className={`h-5 w-5 ${favoriteStatus?.isFavorite ? "fill-current" : ""}`} />
      </Button>
    );
  }

  return (
    <Button
      variant={favoriteStatus?.isFavorite ? "default" : "outline"}
      onClick={handleToggle}
      disabled={toggleFavoriteMutation.isPending}
      className="gap-2"
      data-testid={`button-favorite-${productId}`}
    >
      <Heart className={`h-4 w-4 ${favoriteStatus?.isFavorite ? "fill-current" : ""}`} />
      {favoriteStatus?.isFavorite ? "Saved" : "Save to Wishlist"}
    </Button>
  );
}
