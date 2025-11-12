import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const products = [
  {
    id: "1",
    name: "ENGWE Engine X",
    brand: "Engwe",
    price: 899.99,
    image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533",
    range: "75 miles",
    maxSpeed: "28 mph",
  },
  {
    id: "2",
    name: "Eleglide M2",
    brand: "Eleglide",
    price: 594.99,
    image: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533",
    range: "65 miles",
    maxSpeed: "15.5 mph",
  },
  {
    id: "3",
    name: "DYU A1F Pro",
    brand: "DYU",
    price: 399.99,
    image: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533",
    range: "45 miles",
    maxSpeed: "15.5 mph",
  },
  {
    id: "4",
    name: "Duotts C29",
    brand: "Duotts",
    price: 684.99,
    image: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533",
    range: "80 miles",
    maxSpeed: "15.5 mph",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2" data-testid="text-featured-title">
              Featured E-Bikes
            </h2>
            <p className="text-muted-foreground" data-testid="text-featured-subtitle">
              Discover our most popular electric bikes
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex" data-testid="button-view-all">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onViewDetails={() => console.log('View details:', product.name)}
              onAddToCart={() => console.log('Add to cart:', product.name)}
            />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" data-testid="button-view-all-mobile">
            View All E-Bikes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
