interface BrandLogoProps {
  brand: string;
  className?: string;
}

const brandLogos: Record<string, string> = {
  "ENGWE": "https://www.ozeco.co.uk/cdn/shop/files/engwe-logo.webp?v=1713451363&width=200",
  "Eleglide": "https://www.ozeco.co.uk/cdn/shop/files/eleglide-logo.png?v=1713451363&width=200",
  "DYU": "https://www.ozeco.co.uk/cdn/shop/files/dyu-logo.png?v=1713451363&width=200",
  "Duotts": "https://www.ozeco.co.uk/cdn/shop/files/duotts-logo.png?v=1713451363&width=200",
  "Touroll": "https://www.ozeco.co.uk/cdn/shop/files/touroll-logo.png?v=1713451363&width=200",
  "Fiido": "https://www.ozeco.co.uk/cdn/shop/files/fiido-logo.png?v=1713451363&width=200",
};

export default function BrandLogo({ brand, className = "" }: BrandLogoProps) {
  const logoUrl = brandLogos[brand];

  if (!logoUrl) {
    return (
      <div className={`font-bold text-lg ${className}`}>
        {brand}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${brand} logo`}
      className={`h-8 w-auto object-contain ${className}`}
      data-testid={`img-brand-logo-${brand.toLowerCase()}`}
    />
  );
}
