import { Card } from "@/components/ui/card";
import { Link } from "wouter";

const brands = [
  {
    name: "ENGWE",
    count: "5 models",
    color: "from-red-500/20 to-orange-500/20",
  },
  {
    name: "Eleglide",
    count: "2 models",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Duotts",
    count: "2 models",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Touroll",
    count: "4 models",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    name: "DYU",
    count: "2 models",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    name: "Fiido",
    count: "1 model",
    color: "from-indigo-500/20 to-violet-500/20",
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
              <Card className={`group p-8 text-center hover-elevate active-elevate-2 transition-all cursor-pointer bg-gradient-to-br ${brand.color} border-2`} data-testid={`card-brand-${brand.name.toLowerCase()}`}>
                <div className="flex flex-col items-center justify-center min-h-[120px]">
                  <h3 className="font-display font-bold text-3xl mb-2 group-hover:text-primary transition-colors" data-testid={`text-brand-name-${brand.name.toLowerCase()}`}>
                    {brand.name}
                  </h3>
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
