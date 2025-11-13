import engweLogo from "@assets/IMG_5240_1763073445688.png";
import dyuLogo from "@assets/IMG_5241_1763073445688.png";
import eleglideLogo from "@assets/IMG_5242_1763073445688.jpeg";
import duottsLogo from "@assets/IMG_5243_1763073445688.jpeg";
import fiidoLogo from "@assets/IMG_5244_1763073445688.jpeg";
import tourollLogo from "@assets/IMG_5245_1763073445687.webp";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

const brandLogos: Record<string, string> = {
  ENGWE: engweLogo,
  DYU: dyuLogo,
  Eleglide: eleglideLogo,
  Duotts: duottsLogo,
  Fiido: fiidoLogo,
  Touroll: tourollLogo,
};

export default function BrandLogo({ brand, className = "" }: BrandLogoProps) {
  const logoSrc = brandLogos[brand];
  
  if (!logoSrc) {
    return (
      <div 
        className={`font-semibold text-sm ${className}`}
        data-testid={`brand-${brand.toLowerCase()}`}
      >
        {brand}
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${brand} logo`}
      className={`h-8 w-auto object-contain ${className}`}
      data-testid={`brand-logo-${brand.toLowerCase()}`}
    />
  );
}
