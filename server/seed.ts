import { db } from "@db";
import { products } from "@shared/schema";

const productData = [
  {
    name: "ENGWE Engine X",
    brand: "ENGWE",
    slug: "engwe-engine-x",
    description: "The ultimate urban electric bike combining power and style. Perfect for city commuting with long-range capability and advanced features. UK road legal with 250W motor.",
    price: "899.99",
    originalPrice: "999.99",
    image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533",
    ],
    category: "City",
    inStock: true,
    isBestseller: false,
    motorPower: "250W",
    batteryCapacity: "48V 15Ah",
    maxRange: "75 miles",
    topSpeed: "28 mph",
    weight: "25kg",
    maxLoad: "120kg",
    frameType: "Step-through",
    features: [
      "LCD Display",
      "Integrated Lights",
      "Front Suspension",
      "Disc Brakes",
      "USB Charging Port",
    ],
  },
  {
    name: "Eleglide M2",
    brand: "Eleglide",
    slug: "eleglide-m2",
    description: "Sleek urban electric bike combining style with cutting-edge technology. Our bestseller loved by thousands of UK riders. Perfect for daily commuting and weekend adventures.",
    price: "594.99",
    originalPrice: "614.99",
    image: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533",
    ],
    category: "City",
    inStock: true,
    isBestseller: true,
    motorPower: "250W",
    batteryCapacity: "36V 12.5Ah",
    maxRange: "65 miles",
    topSpeed: "15.5 mph",
    weight: "23kg",
    maxLoad: "100kg",
    frameType: "Mountain",
    features: [
      "Shimano 7-Speed",
      "LED Display",
      "Front Suspension",
      "Disc Brakes",
      "Removable Battery",
    ],
  },
  {
    name: "DYU A1F Pro",
    brand: "DYU",
    slug: "dyu-a1f-pro",
    description: "Compact folding electric bike perfect for commuters and city living. Ultra-portable design that fits in your car boot. Great value for money.",
    price: "379.99",
    originalPrice: "399.99",
    image: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533",
    ],
    category: "Folding",
    inStock: true,
    isBestseller: false,
    motorPower: "250W",
    batteryCapacity: "36V 10Ah",
    maxRange: "45 miles",
    topSpeed: "15.5 mph",
    weight: "18kg",
    maxLoad: "120kg",
    frameType: "Folding",
    features: [
      "Ultra Compact",
      "LED Display",
      "Front & Rear Lights",
      "Disc Brakes",
      "Quick Fold Mechanism",
    ],
  },
  {
    name: "Duotts C29",
    brand: "Duotts",
    slug: "duotts-c29",
    description: "Premium electric bike with exceptional performance and design. Long-range capability with comfortable riding position. Perfect for longer commutes and weekend rides.",
    price: "684.99",
    originalPrice: null,
    image: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533",
    ],
    category: "Mountain",
    inStock: true,
    isBestseller: false,
    motorPower: "250W",
    batteryCapacity: "48V 14Ah",
    maxRange: "80 miles",
    topSpeed: "15.5 mph",
    weight: "26kg",
    maxLoad: "120kg",
    frameType: "Mountain",
    features: [
      "29-inch Wheels",
      "Shimano 7-Speed",
      "Front Suspension",
      "Hydraulic Disc Brakes",
      "LCD Display",
    ],
  },
  {
    name: "ENGWE X26",
    brand: "ENGWE",
    slug: "engwe-x26",
    description: "Powerful off-road electric bike built for adventure and long-range rides. Fat tires provide excellent traction on any terrain. Perfect for trail riding and outdoor exploration.",
    price: "1199.99",
    originalPrice: null,
    image: "https://www.ozeco.co.uk/cdn/shop/files/engwe-x26-fat-tire.png?v=1747666206&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/engwe-x26-fat-tire.png?v=1747666206&width=533",
    ],
    category: "Off-Road",
    inStock: true,
    isBestseller: false,
    motorPower: "250W",
    batteryCapacity: "48V 19.2Ah",
    maxRange: "90 miles",
    topSpeed: "15.5 mph",
    weight: "32kg",
    maxLoad: "150kg",
    frameType: "Fat Tire",
    features: [
      "26-inch Fat Tires",
      "Full Suspension",
      "Hydraulic Disc Brakes",
      "Color LCD Display",
      "All-Terrain Capable",
    ],
  },
  {
    name: "Touroll H7",
    brand: "Touroll",
    slug: "touroll-h7",
    description: "Innovative electric bike designed for versatile urban mobility. Comfortable step-through frame with integrated cargo rack. Perfect for shopping trips and daily errands.",
    price: "749.99",
    originalPrice: null,
    image: "https://www.ozeco.co.uk/cdn/shop/files/touroll-h7-city.png?v=1747666206&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/touroll-h7-city.png?v=1747666206&width=533",
    ],
    category: "City",
    inStock: true,
    isBestseller: false,
    motorPower: "250W",
    batteryCapacity: "48V 12Ah",
    maxRange: "60 miles",
    topSpeed: "15.5 mph",
    weight: "24kg",
    maxLoad: "120kg",
    frameType: "Step-through",
    features: [
      "Integrated Cargo Rack",
      "Shimano 7-Speed",
      "Front & Rear Lights",
      "Disc Brakes",
      "Comfortable Saddle",
    ],
  },
];

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Clear existing products
    await db.delete(products);
    console.log("Cleared existing products");
    
    // Insert new products
    for (const product of productData) {
      await db.insert(products).values(product);
      console.log(`Added product: ${product.name}`);
    }
    
    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
