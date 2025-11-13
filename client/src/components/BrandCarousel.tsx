import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import BrandLogo from "./BrandLogo";

const brands = [
  {
    name: "ENGWE",
    count: "5 models",
  },
  {
    name: "Eleglide",
    count: "2 models",
  },
  {
    name: "Duotts",
    count: "2 models",
  },
  {
    name: "Touroll",
    count: "4 models",
  },
  {
    name: "DYU",
    count: "2 models",
  },
  {
    name: "Fiido",
    count: "1 model",
  },
];

export default function BrandCarousel() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-brands-title">
            Shop by Brand
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated selection of premium Electric bike brands
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {brands.map((brand) => (
            <Link key={brand.name} href={`/shop?brand=${brand.name}`}>
              <Card className="group p-6 text-center hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid={`card-brand-${brand.name.toLowerCase()}`}>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full aspect-square mb-3 flex items-center justify-center bg-background rounded-md overflow-hidden p-4">
                    <BrandLogo 
                      brand={brand.name}
                      className="w-full h-full transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{brand.count}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
