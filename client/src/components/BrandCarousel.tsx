import { Card } from "@/components/ui/card";
import { Link } from "wouter";

const brands = [
  {
    name: "ENGWE",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=300",
    count: "5 models",
  },
  {
    name: "Eleglide",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=300",
    count: "2 models",
  },
  {
    name: "Duotts",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=300",
    count: "2 models",
  },
  {
    name: "Touroll",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/rmvdgprc.png?v=1747599362&width=300",
    count: "4 models",
  },
  {
    name: "DYU",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=300",
    count: "2 models",
  },
  {
    name: "Fiido",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/90049290-9427-4A46-BF7D-27568625A99B.jpg?v=1753272803&width=300",
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
                <div className="aspect-square mb-4 flex items-center justify-center bg-background rounded-lg overflow-hidden">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} Electric bikes`}
                    className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110"
                    data-testid={`img-brand-${brand.name.toLowerCase()}`}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors" data-testid={`text-brand-name-${brand.name.toLowerCase()}`}>
                  {brand.name}
                </h3>
                <p className="text-sm text-muted-foreground">{brand.count}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
