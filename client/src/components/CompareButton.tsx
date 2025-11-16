import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompareButtonProps {
  productId: string;
  productName: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export default function CompareButton({ productId, productName, size = "sm" }: CompareButtonProps) {
  const [isInCompare, setIsInCompare] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("compareProducts");
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setIsInCompare(ids.includes(productId));
      } catch {
        setIsInCompare(false);
      }
    }
  }, [productId]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = localStorage.getItem("compareProducts");
    let ids: string[] = [];
    
    try {
      ids = stored ? JSON.parse(stored) : [];
    } catch {
      ids = [];
    }

    if (ids.includes(productId)) {
      // Remove from compare
      const newIds = ids.filter((id) => id !== productId);
      localStorage.setItem("compareProducts", JSON.stringify(newIds));
      setIsInCompare(false);
      toast({
        title: "Removed from comparison",
        description: `${productName} has been removed from comparison.`,
      });
    } else {
      // Add to compare
      if (ids.length >= 3) {
        toast({
          title: "Maximum reached",
          description: "You can compare up to 3 products at a time.",
          variant: "destructive",
        });
        return;
      }
      
      const newIds = [...ids, productId];
      localStorage.setItem("compareProducts", JSON.stringify(newIds));
      setIsInCompare(true);
      toast({
        title: "Added to comparison",
        description: `${productName} has been added to comparison list.`,
      });
    }
  };

  return (
    <Button
      variant={isInCompare ? "default" : "outline"}
      size={size}
      onClick={handleToggleCompare}
      className="gap-1"
      data-testid={`button-compare-${productId}`}
    >
      <GitCompare className="h-4 w-4" />
      {isInCompare ? "Added" : "Compare"}
    </Button>
  );
}
