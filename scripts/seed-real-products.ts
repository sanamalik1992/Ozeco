// Script to seed database with real products from ozeco.co.uk
import { db } from '../db/index';
import { products } from '../shared/schema';

const realProducts = [
  {
    name: "ENGWE Engine X Electric Bike",
    slug: "engwe-engine-x",
    brand: "ENGWE",
    category: "Electric Folding Bikes",
    price: "899.99",
    description: "Versatile, foldable electric bike designed for both urban travel and off-road adventure. With powerful 250W motor, all-terrain fat tyres, and front and rear suspension.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/or68pika.png?v=1747666416&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/bjy0kolj.png?v=1747666224&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/my12xz6m.png?v=1747666244&width=533"
    ],
    features: ["250W Brushless Motor", "Removable 48V Battery", "Fat 20x4.0 Tyres", "7-Speed Shimano", "LCD Dashboard", "Folding Frame"],
    maxRange: "90-100 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "48V 13Ah",
    weight: "30.1 kg",
    maxLoad: "150 kg",
    isBestseller: true,
    stockStatus: "in_stock"
  },
  {
    name: "Eleglide M2 Electric Bike",
    slug: "eleglide-m2",
    brand: "Eleglide",
    category: "Electric Mountain Bikes",
    price: "594.99",
    originalPrice: "644.99",
    description: "High-spec electric mountain bike built for both adventure and everyday riding. Featuring powerful 250W motor, long-lasting 15Ah battery, and advanced components like hydraulic suspension and disc brakes.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/eleglide-m2-electric-mountain-electric-bike-uk-pogo-cycles-5.jpg?v=1747598026&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/eleglide-m2-electric-mountain-electric-bike-uk-pogo-cycles-4.jpg?v=1747598025&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/M2.jpg?v=1747598026&width=533"
    ],
    features: ["High-Torque 250W Motor", "Removable 15Ah Battery", "Shimano 21-Speed", "Hydraulic Front Suspension", "Hydraulic Disc Brakes", "Smart LCD Display", "Mobile App Control"],
    maxRange: "125 km",
    topSpeed: "25 km/h",
    motorPower: "250W (Peak 570W)",
    batteryCapacity: "36V 15Ah",
    weight: "22 kg",
    maxLoad: "120 kg",
    isBestseller: true,
    stockStatus: "in_stock"
  },
  {
    name: "Eleglide M1 Plus Electric Bike",
    slug: "eleglide-m1-plus",
    brand: "Eleglide",
    category: "Electric Mountain Bikes",
    price: "499.99",
    description: "Lightweight commuter Electric bike perfect for daily urban travel with excellent range and performance.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533",
    features: ["250W Motor", "Shimano 7-Speed", "Hydraulic Disc Brakes", "LED Display", "Removable Battery"],
    maxRange: "100 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 12.5Ah",
    isBestseller: true,
    stockStatus: "in_stock"
  },
  {
    name: "DYU A1F Pro Electric Bike",
    slug: "dyu-a1f-pro",
    brand: "DYU",
    category: "Electric Folding Bikes",
    price: "399.99",
    originalPrice: "449.99",
    description: "Smart, space-saving electric bike designed for everyday urban commuting. With 250W motor, pedal assist, and foldable aluminium frame.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533",
    images: [
      "https://www.ozeco.co.uk/cdn/shop/files/xauyyjtg.png?v=1747601601&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/j8l4vqv8.png?v=1747601601&width=533",
      "https://www.ozeco.co.uk/cdn/shop/files/v77nrjxd.png?v=1747601600&width=533"
    ],
    features: ["250W Brushless Motor", "36V Lithium Battery", "Foldable Frame", "Front and Rear Lights", "Rear Cargo Rack", "Cruise Control"],
    maxRange: "45 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 7.5Ah",
    weight: "22 kg",
    maxLoad: "75 kg",
    isBestseller: true,
    stockStatus: "low_stock"
  },
  {
    name: "ENGWE Engine Pro 2.0 Electric Bike",
    slug: "engwe-engine-pro-2-0",
    brand: "ENGWE",
    category: "Electric Fat Bikes",
    price: "1129.99",
    description: "Premium fat tire Electric bike for all-terrain adventures with powerful motor and long-range battery.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/nsxjf14r.png?v=1747666607&width=533",
    features: ["750W Motor", "Fat Tires", "Full Suspension", "LCD Display", "Long Range Battery"],
    maxRange: "110 km",
    topSpeed: "28 mph",
    motorPower: "750W",
    batteryCapacity: "48V 16Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "ENGWE EP-2 Boost Electric Bike",
    slug: "engwe-ep-2-boost",
    brand: "ENGWE",
    category: "Electric Mountain Bikes",
    price: "849.99",
    originalPrice: "899.99",
    description: "High-performance mountain Electric bike with impressive range and advanced features.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/xs5uq1va.png?v=1747601026&width=533",
    features: ["500W Motor", "Front Suspension", "Mechanical Disc Brakes", "Removable Battery"],
    maxRange: "100 km",
    topSpeed: "25 km/h",
    motorPower: "500W",
    batteryCapacity: "48V 15Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "ENGWE L20 3.0 Boost",
    slug: "engwe-l20",
    brand: "ENGWE",
    category: "Electric Cargo Bikes",
    price: "999.99",
    originalPrice: "1049.99",
    description: "Practical cargo Electric bike for family and delivery use with robust design.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/IMG-2140.webp?v=1756504566&width=400",
    features: ["350W Motor", "Cargo Rack", "Step-Through Frame", "Puncture-Resistant Tires"],
    maxRange: "80 km",
    topSpeed: "25 km/h",
    motorPower: "350W",
    batteryCapacity: "48V 13Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "ENGWE T14 Electric Bike",
    slug: "engwe-t14",
    brand: "ENGWE",
    category: "Electric City Bikes",
    price: "474.99",
    description: "Affordable city Electric bike perfect for daily commuting.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/fonogapi.png?v=1747666664&width=533",
    features: ["250W Motor", "Lightweight Frame", "LED Lights", "Comfort Saddle"],
    maxRange: "50 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 10Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "Duotts C29 Electric Bike",
    slug: "duotts-c29",
    brand: "Duotts",
    category: "Electric Mountain Bikes",
    price: "684.99",
    description: "High-performance mountain Electric bike with impressive range.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533",
    features: ["500W Motor", "Front Suspension", "29 Inch Wheels", "Mechanical Disc Brakes"],
    maxRange: "80 km",
    topSpeed: "25 km/h",
    motorPower: "500W",
    batteryCapacity: "48V 15Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "Duotts S26 Electric Bike",
    slug: "duotts-s26",
    brand: "Duotts",
    category: "Electric Mountain Bikes",
    price: "1099.00",
    description: "Premium mountain Electric bike with advanced suspension system.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/fjetvtsr.png?v=1747603276&width=533",
    features: ["750W Motor", "Full Suspension", "26 Inch Fat Tires", "Hydraulic Brakes"],
    maxRange: "90 km",
    topSpeed: "28 mph",
    motorPower: "750W",
    batteryCapacity: "48V 17.5Ah",
    isBestseller: false,
    stockStatus: "low_stock"
  },
  {
    name: "DYU D3F Electric Bike",
    slug: "dyu-d3f",
    brand: "DYU",
    category: "Electric Folding Bikes",
    price: "379.99",
    description: "Compact folding Electric bike ideal for storage and transport.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/22c1e2d3-5590-4728-8f2d-8e3a1eee25a6.jpg?v=1747601508&width=533",
    features: ["250W Motor", "Foldable Design", "14 Inch Wheels", "Lightweight Frame"],
    maxRange: "40 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 10Ah",
    isBestseller: false,
    stockStatus: "low_stock"
  },
  {
    name: "Fiido D3 Pro",
    slug: "fiido-d3-pro",
    brand: "Fiido",
    category: "Electric Folding Bikes",
    price: "359.99",
    description: "Budget-friendly folding Electric bike perfect for short commutes.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/90049290-9427-4A46-BF7D-27568625A99B.jpg?v=1753272803&width=533",
    features: ["250W Motor", "Ultra Compact", "Quick Fold", "LED Display"],
    maxRange: "35 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 7.8Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  },
  {
    name: "Touroll B1 Electric Bike",
    slug: "touroll-b1",
    brand: "Touroll",
    category: "Electric City Bikes",
    price: "529.99",
    description: "Stylish city Electric bike with modern design and reliable performance.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/rmvdgprc.png?v=1747599362&width=533",
    features: ["250W Motor", "Integrated Lights", "Comfort Geometry", "7-Speed Gears"],
    maxRange: "60 km",
    topSpeed: "25 km/h",
    motorPower: "250W",
    batteryCapacity: "36V 10.4Ah",
    isBestseller: false,
    stockStatus: "low_stock"
  },
  {
    name: "Touroll J1 Electric Bike",
    slug: "touroll-j1",
    brand: "Touroll",
    category: "Electric Commuter Bikes",
    price: "599.99",
    description: "Premium commuter Electric bike with excellent battery life.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/701w2hia.png?v=1747599795&width=533",
    features: ["350W Motor", "Long Range", "Hydraulic Brakes", "Smart Display"],
    maxRange: "75 km",
    topSpeed: "25 km/h",
    motorPower: "350W",
    batteryCapacity: "36V 12.8Ah",
    isBestseller: false,
    stockStatus: "low_stock"
  },
  {
    name: "Touroll J1 ST Electric Bike",
    slug: "touroll-j1-st",
    brand: "Touroll",
    category: "Electric Commuter Bikes",
    price: "619.99",
    description: "Step-through commuter Electric bike for easy mounting and comfort.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/zxhmyfkz.png?v=1747600071&width=533",
    features: ["350W Motor", "Step-Through Frame", "Comfort Saddle", "Integrated Rack"],
    maxRange: "75 km",
    topSpeed: "25 km/h",
    motorPower: "350W",
    batteryCapacity: "36V 12.8Ah",
    isBestseller: false,
    stockStatus: "low_stock"
  },
  {
    name: "Touroll U1 Electric Bike",
    slug: "touroll-u1",
    brand: "Touroll",
    category: "Electric Mountain Bikes",
    price: "509.99",
    description: "Versatile mountain Electric bike for trails and city riding.",
    image: "https://www.ozeco.co.uk/cdn/shop/files/touroll-u1-26-inch-off-road-tire-electric-bike-uk-pogo-cycles-3.jpg?v=1747599446&width=533",
    features: ["350W Motor", "26 Inch Tires", "Front Suspension", "7-Speed Shimano"],
    maxRange: "65 km",
    topSpeed: "25 km/h",
    motorPower: "350W",
    batteryCapacity: "36V 10Ah",
    isBestseller: false,
    stockStatus: "in_stock"
  }
];

async function seedProducts() {
  console.log('Starting to seed products...');
  
  // First, delete all existing products
  await db.delete(products);
  console.log('Cleared existing products');
  
  // Insert all real products
  for (const product of realProducts) {
    await db.insert(products).values(product);
    console.log(`Added: ${product.name}`);
  }
  
  console.log(`\n✅ Successfully seeded ${realProducts.length} products from ozeco.co.uk`);
  process.exit(0);
}

seedProducts().catch((error) => {
  console.error('❌ Error seeding products:', error);
  process.exit(1);
});
