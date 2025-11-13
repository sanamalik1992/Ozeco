import { Card } from "@/components/ui/card";
import { Link } from "wouter";

const brands = [
  {
    name: "ENGWE",
    count: "5 models",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=300",
  },
  {
    name: "Eleglide",
    count: "2 models",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=300",
  },
  {
    name: "Duotts",
    count: "2 models",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=300",
  },
  {
    name: "Touroll",
    count: "4 models",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/rmvdgprc.png?v=1747599362&width=300",
  },
  {
    name: "DYU",
    count: "2 models",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=300",
  },
  {
    name: "Fiido",
    count: "1 model",
    logo: "https://www.ozeco.co.uk/cdn/shop/files/90049290-9427-4A46-BF7D-27568625A99B.jpg?v=1753272803&width=300",
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
                  <h3 className="font-display font-bold text-xl mb-3 group-hover:text-primary transition-colors" data-testid={`text-brand-name-${brand.name.toLowerCase()}`}>
                    {brand.name}
                  </h3>
                  <div className="w-full aspect-square mb-3 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
                    <img
                      src={brand.logo}
                      alt={`${brand.name} Electric bikes`}
                      className="w-full h-full object-contain p-3 transition-transform group-hover:scale-110"
                      data-testid={`img-brand-logo-${brand.name.toLowerCase()}`}
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
