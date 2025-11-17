import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function seedProduction() {
  const productionDbUrl = process.env.DATABASE_URL;
  
  if (!productionDbUrl) {
    console.error('❌ DATABASE_URL not found. Please set it to your production database URL.');
    process.exit(1);
  }

  console.log('🔄 Connecting to production database...');
  const pool = new Pool({ connectionString: productionDbUrl });

  try {
    const products = [
      {
        name: 'DYU A1F Pro Electric Bike',
        brand: 'DYU',
        slug: 'dyu-a1f-pro',
        description: 'Compact and portable folding electric bike perfect for urban commuting. Features a lightweight aluminum frame and powerful 250W motor.',
        price: '359.99',
        original_price: '449.99',
        image: 'https://ozeco.co.uk/cdn/shop/files/a1fpro_1_800x.webp?v=1723467776',
        images: ['https://ozeco.co.uk/cdn/shop/files/a1fpro_1_800x.webp?v=1723467776', 'https://ozeco.co.uk/cdn/shop/files/a1fpro_2_800x.webp?v=1723467776'],
        category: 'Folding',
        in_stock: true,
        stock_quantity: 15,
        is_bestseller: true,
        motor_power: '250W',
        battery_capacity: '10.4Ah',
        max_range: '40km',
        top_speed: '25 km/h',
        weight: '17.5kg',
        max_load: '120kg',
        frame_type: 'Aluminum Alloy',
        rider_height: '150-190cm',
        features: ['Foldable Design', 'LED Display', 'Disc Brakes', 'USB Charging Port']
      },
      {
        name: 'Eleglide M2 Electric Bike',
        brand: 'Eleglide',
        slug: 'eleglide-m2',
        description: 'Premium mountain electric bike with 29-inch wheels and dual suspension. Perfect for off-road adventures and trail riding.',
        price: '849.99',
        original_price: '1099.99',
        image: 'https://ozeco.co.uk/cdn/shop/files/m2_1_800x.webp?v=1723468234',
        images: ['https://ozeco.co.uk/cdn/shop/files/m2_1_800x.webp?v=1723468234', 'https://ozeco.co.uk/cdn/shop/files/m2_2_800x.webp?v=1723468234'],
        category: 'Mountain',
        in_stock: true,
        stock_quantity: 8,
        is_bestseller: true,
        motor_power: '250W',
        battery_capacity: '12.5Ah',
        max_range: '65km',
        top_speed: '25 km/h',
        weight: '25kg',
        max_load: '120kg',
        frame_type: 'Aluminum Alloy',
        rider_height: '165-195cm',
        features: ['29" Wheels', 'Front Suspension', 'Shimano 7-Speed', 'Hydraulic Disc Brakes']
      },
      {
        name: 'ENGWE Engine X Electric Bike',
        brand: 'ENGWE',
        slug: 'engwe-engine-x',
        description: 'Powerful folding fat tire electric bike with dual battery option. Built for adventure with superior off-road capability.',
        price: '1099.99',
        original_price: '1299.99',
        image: 'https://ozeco.co.uk/cdn/shop/files/enginex_1_800x.webp?v=1723467923',
        images: ['https://ozeco.co.uk/cdn/shop/files/enginex_1_800x.webp?v=1723467923', 'https://ozeco.co.uk/cdn/shop/files/enginex_2_800x.webp?v=1723467923'],
        category: 'Folding',
        in_stock: true,
        stock_quantity: 12,
        is_bestseller: true,
        motor_power: '250W',
        battery_capacity: '19.2Ah',
        max_range: '150km',
        top_speed: '25 km/h',
        weight: '35kg',
        max_load: '150kg',
        frame_type: 'Aluminum Alloy',
        rider_height: '160-200cm',
        features: ['Fat Tires', 'Dual Battery', 'Full Suspension', 'Color Display']
      },
      {
        name: 'Eleglide M1 Plus Electric Bike',
        brand: 'Eleglide',
        slug: 'eleglide-m1-plus',
        description: 'Versatile mountain electric bike with excellent range and performance. Features a robust frame and reliable components.',
        price: '699.99',
        original_price: '899.99',
        image: 'https://ozeco.co.uk/cdn/shop/files/m1plus_1_800x.webp?v=1723468189',
        images: ['https://ozeco.co.uk/cdn/shop/files/m1plus_1_800x.webp?v=1723468189', 'https://ozeco.co.uk/cdn/shop/files/m1plus_2_800x.webp?v=1723468189'],
        category: 'Mountain',
        in_stock: true,
        stock_quantity: 10,
        is_bestseller: true,
        motor_power: '250W',
        battery_capacity: '12.5Ah',
        max_range: '60km',
        top_speed: '25 km/h',
        weight: '23kg',
        max_load: '120kg',
        frame_type: 'Aluminum Alloy',
        rider_height: '165-190cm',
        features: ['27.5" Wheels', 'Shimano 7-Speed', 'Disc Brakes', 'LED Display']
      }
    ];

    console.log('📦 Inserting products into production database...');
    
    for (const product of products) {
      await pool.query(`
        INSERT INTO products (
          name, brand, slug, description, price, original_price, image, images,
          category, in_stock, stock_quantity, is_bestseller, motor_power,
          battery_capacity, max_range, top_speed, weight, max_load, frame_type,
          rider_height, features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          stock_quantity = EXCLUDED.stock_quantity,
          is_bestseller = EXCLUDED.is_bestseller
      `, [
        product.name, product.brand, product.slug, product.description,
        product.price, product.original_price, product.image, product.images,
        product.category, product.in_stock, product.stock_quantity, product.is_bestseller,
        product.motor_power, product.battery_capacity, product.max_range, product.top_speed,
        product.weight, product.max_load, product.frame_type, product.rider_height, product.features
      ]);
      
      console.log(`✅ Added: ${product.name}`);
    }

    console.log('\n🎉 Production database seeded successfully!');
    console.log(`📊 Total products: ${products.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedProduction();
