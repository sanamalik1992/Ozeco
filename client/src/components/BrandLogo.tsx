import { Badge } from "@/components/ui/badge";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export default function BrandLogo({ brand, className = "" }: BrandLogoProps) {
  return (
    <Badge 
      variant="outline" 
      className={`font-semibold text-sm ${className}`}
      data-testid={`badge-brand-${brand.toLowerCase()}`}
    >
      {brand}
    </Badge>
  );
}
