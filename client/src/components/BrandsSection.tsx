import BrandCard from "./BrandCard";

const brands = [
  {
    name: "ENGWE",
    description: "Powerful off-road Electric bikes built for adventure and long-range rides.",
  },
  {
    name: "Eleglide",
    description: "Sleek urban Electric bikes combining style with cutting-edge technology.",
  },
  {
    name: "DYU",
    description: "Compact folding Electric bikes perfect for commuters and city living.",
  },
  {
    name: "Duotts",
    description: "Premium Electric bikes with exceptional performance and design.",
  },
  {
    name: "Touroll",
    description: "Innovative Electric bikes designed for versatile urban mobility.",
  },
];

export default function BrandsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-brands-title">
            Shop by Brand
          </h2>
          <p className="text-muted-foreground text-lg" data-testid="text-brands-subtitle">
            Premium Electric bikes from trusted manufacturers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <BrandCard
              key={brand.name}
              name={brand.name}
              description={brand.description}
              onClick={() => console.log('Brand clicked:', brand.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
