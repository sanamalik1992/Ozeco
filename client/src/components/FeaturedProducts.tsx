import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import productImage1 from "@assets/generated_images/Black_e-bike_white_background_79ee0cad.png";
import productImage2 from "@assets/generated_images/White_city_e-bike_5041c7ba.png";
import productImage3 from "@assets/generated_images/Red_folding_e-bike_7174f629.png";
import productImage4 from "@assets/generated_images/Grey_cargo_e-bike_c9740836.png";

const products = [
  {
    id: "1",
    name: "Engwe Engine Pro",
    brand: "Engwe",
    price: 1299,
    image: productImage1,
    range: "75 miles",
    maxSpeed: "28 mph",
  },
  {
    id: "2",
    name: "Eleglide T1 Step-Thru",
    brand: "Eleglide",
    price: 899,
    image: productImage2,
    range: "65 miles",
    maxSpeed: "15.5 mph",
  },
  {
    id: "3",
    name: "DYU King 750",
    brand: "DYU",
    price: 749,
    image: productImage3,
    range: "45 miles",
    maxSpeed: "15.5 mph",
  },
  {
    id: "4",
    name: "DUOTTS C29 Cargo",
    brand: "DUOTTS",
    price: 1499,
    image: productImage4,
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
