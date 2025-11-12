import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BrandCardProps {
  name: string;
  description: string;
  onClick?: () => void;
}

export default function BrandCard({ name, description, onClick }: BrandCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 transition-all" data-testid={`card-brand-${name.toLowerCase()}`}>
      <CardContent className="p-6">
        <h3 className="text-2xl font-display font-bold mb-3" data-testid={`text-brand-name-${name.toLowerCase()}`}>
          {name}
        </h3>
        <p className="text-muted-foreground mb-4" data-testid={`text-brand-description-${name.toLowerCase()}`}>
          {description}
        </p>
        <Button
          variant="ghost"
          className="group"
          onClick={onClick}
          data-testid={`button-shop-${name.toLowerCase()}`}
        >
          Shop {name}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
