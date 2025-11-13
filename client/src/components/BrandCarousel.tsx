import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import BrandLogo from "./BrandLogo";

const brands = [
  {
    name: "ENGWE",
    count: "5 models",
    bgGradient: "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    name: "Eleglide",
    count: "2 models",
    bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    name: "Duotts",
    count: "2 models",
    bgGradient: "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    name: "Touroll",
    count: "4 models",
    bgGradient: "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    name: "DYU",
    count: "2 models",
    bgGradient: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    name: "Fiido",
    count: "1 model",
    bgGradient: "from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
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
              <Card className="group overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer border-2" data-testid={`card-brand-${brand.name.toLowerCase()}`}>
                <div className="flex flex-col items-center justify-center p-6">
                  <div className={`w-full aspect-square mb-4 flex items-center justify-center bg-gradient-to-br ${brand.bgGradient} rounded-lg border-2 ${brand.borderColor} overflow-hidden p-6 shadow-sm transition-all group-hover:shadow-md`}>
                    <BrandLogo 
                      brand={brand.name}
                      className="w-full h-full transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">{brand.count}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
