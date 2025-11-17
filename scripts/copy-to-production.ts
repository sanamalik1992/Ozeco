import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function copyToProduction() {
  // Get DATABASE_URL from environment (this should point to your PRODUCTION database)
  const productionDbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!productionDbUrl) {
    console.error('❌ DATABASE_URL not found. Cannot connect to production database.');
    console.error('Please make sure DATABASE_URL is set to your PRODUCTION database connection string.');
    process.exit(1);
  }

  console.log('🔄 Connecting to production database...');
  const pool = new Pool({ connectionString: productionDbUrl });

  try {
    // All 16 products from development database with real data
    const allProducts = `
INSERT INTO products (name, brand, slug, description, price, original_price, image, images, category, in_stock, stock_quantity, is_bestseller, motor_power, battery_capacity, max_range, top_speed, weight, max_load, rider_height, features) VALUES
('DYU A1F Pro Electric Bike', 'DYU', 'dyu-a1f-pro', 'Smart, space-saving electric bike designed for everyday urban commuting. With 250W motor, pedal assist, and foldable aluminium frame.', 399.99, 449.99, 'https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533', ARRAY['/products/dyu-a1f-pro/1.png','/products/dyu-a1f-pro/2.png','/products/dyu-a1f-pro/3.png','/products/dyu-a1f-pro/4.png','/products/dyu-a1f-pro/5.png','/products/dyu-a1f-pro/6.png','/products/dyu-a1f-pro/7.png','/products/dyu-a1f-pro/8.png'], 'Folding', false, 3, true, '250W', '36V 7.5Ah', '45 km', '25 km/h', '22 kg', '75 kg', '5''0" - 5''8" (150-173 cm)', ARRAY['250W Brushless Motor','36V Lithium Battery','Foldable Frame','Front and Rear Lights','Rear Cargo Rack']),
('Eleglide M2 Electric Bike', 'Eleglide', 'eleglide-m2', 'High-spec electric mountain bike built for both adventure and everyday riding. Featuring powerful 250W motor, long-lasting 15Ah battery.', 549.99, 644.99, 'https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533', ARRAY['/products/eleglide-m2/1.png','/products/eleglide-m2/2.jpg','/products/eleglide-m2/3.jpg','/products/eleglide-m2/4.jpg','/products/eleglide-m2/5.png','/products/eleglide-m2/6.png','/products/eleglide-m2/7.jpg','/products/eleglide-m2/8.png'], 'Mountain', true, 8, true, '250W', '36V 15Ah', '125 km', '25 km/h', '22 kg', '120 kg', '5''3" - 6''5" (160-195 cm)', ARRAY['High-Torque 250W Motor','Removable 15Ah Battery','Shimano 21-Speed','Hydraulic Front Suspension','Hydraulic Disc Brakes']),
('ENGWE Engine X Electric Bike', 'ENGWE', 'engwe-engine-x', 'Versatile, foldable electric bike designed for both urban travel and off-road adventure. With powerful 250W motor, all-terrain fat tyres, and front and rear suspension.', 899.99, 919.99, 'https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533', ARRAY['/products/engwe-engine-x/1.png','/products/engwe-engine-x/2.png','/products/engwe-engine-x/3.png','/products/engwe-engine-x/4.png','/products/engwe-engine-x/5.png','/products/engwe-engine-x/6.png','/products/engwe-engine-x/7.png','/products/engwe-engine-x/8.png'], 'Folding', false, 0, true, '250W', '48V 13Ah', '90-100 km', '25 km/h', '30.1 kg', '150 kg', '5''4" - 6''2" (163-188 cm)', ARRAY['250W Brushless Motor','Removable 48V Battery','Fat 20x4.0 Tyres','7-Speed Shimano','LCD Dashboard','Folding Frame']),
('Eleglide M1 Plus Electric Bike', 'Eleglide', 'eleglide-m1-plus', 'Lightweight commuter Electric bike perfect for daily urban travel with excellent range and performance.', 499.99, 519.99, 'https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533', ARRAY['/products/eleglide-m1-plus/1.png','/products/eleglide-m1-plus/2.png','/products/eleglide-m1-plus/3.png','/products/eleglide-m1-plus/4.png','/products/eleglide-m1-plus/5.png','/products/eleglide-m1-plus/6.png','/products/eleglide-m1-plus/7.png','/products/eleglide-m1-plus/8.png'], 'Mountain', true, 6, true, '250W', '36V 12.5Ah', '100 km', '25 km/h', NULL, NULL, '5''3" - 6''5" (160-195 cm)', ARRAY['250W Motor','Shimano 7-Speed','Hydraulic Disc Brakes','LED Display','Removable Battery']),
('ENGWE EP-2 Boost Electric Bike', 'ENGWE', 'engwe-ep-2-boost', 'High-performance mountain Electric bike with impressive range and advanced features.', 849.99, 899.99, 'https://engwe-bikes-uk.com/cdn/shop/files/2_f7000d51-73b1-442e-9190-8c7e25f9bf48.jpg?v=1753325816&width=1500', ARRAY['https://engwe-bikes-uk.com/cdn/shop/files/2_f7000d51-73b1-442e-9190-8c7e25f9bf48.jpg?v=1753325816&width=1500','https://engwe-bikes-uk.com/cdn/shop/files/1_fff95917-986e-48c3-bb0f-168ea6386d3a.jpg?v=1753065836&width=1500'], 'Folding', true, 7, false, '500W', '48V 15Ah', '100 km', '25 km/h', NULL, NULL, '5''4" - 6''2" (165-190 cm)', ARRAY['500W Motor','Front Suspension','Mechanical Disc Brakes','Removable Battery']),
('ENGWE Engine Pro 2.0 Electric Bike', 'ENGWE', 'engwe-engine-pro-2-0', 'Premium fat tire Electric bike for all-terrain adventures with powerful motor and long-range battery.', 1129.99, 1149.99, 'https://www.ozeco.co.uk/cdn/shop/files/nsxjf14r.png?v=1747666607&width=533', ARRAY['/products/engwe-engine-pro-2-0/1.png','/products/engwe-engine-pro-2-0/2.png','/products/engwe-engine-pro-2-0/3.png','/products/engwe-engine-pro-2-0/4.png','/products/engwe-engine-pro-2-0/5.png','/products/engwe-engine-pro-2-0/6.png'], 'Folding', true, 8, false, '750W', '48V 16Ah', '110 km', '28 mph', NULL, NULL, '5''4" - 6''2" (162-188 cm)', ARRAY['750W Motor','Fat Tires','Full Suspension','LCD Display','Long Range Battery']),
('ENGWE T14 Electric Bike', 'ENGWE', 'engwe-t14', 'Affordable city Electric bike perfect for daily commuting.', 474.99, 494.99, 'https://www.ozeco.co.uk/cdn/shop/files/fonogapi.png?v=1747666664&width=533', ARRAY['/products/engwe-t14/1.jpg','/products/engwe-t14/2.png','/products/engwe-t14/3.png','/products/engwe-t14/4.png','/products/engwe-t14/5.png','/products/engwe-t14/6.png','/products/engwe-t14/7.png','/products/engwe-t14/8.png'], 'Folding', false, 0, false, '250W', '36V 10Ah', '50 km', '25 km/h', NULL, NULL, '5''1" - 6''5" (155-195 cm)', ARRAY['250W Motor','Lightweight Frame','LED Lights','Comfort Saddle']),
('ENGWE L20 3.0 Boost', 'ENGWE', 'engwe-l20', 'Practical cargo Electric bike for family and delivery use with robust design.', 999.99, 1049.99, 'https://www.ozeco.co.uk/cdn/shop/files/IMG-2140.webp?v=1756504566&width=400', ARRAY['/products/engwe-l20/1.webp','/products/engwe-l20/2.webp'], 'City', true, 5, false, '350W', '48V 13Ah', '80 km', '25 km/h', NULL, NULL, '5''1" - 6''3" (155-190 cm)', ARRAY['350W Motor','Cargo Rack','Step-Through Frame','Puncture-Resistant Tires']),
('DYU D3F Electric Bike', 'DYU', 'dyu-d3f', 'Compact folding Electric bike ideal for storage and transport.', 379.99, 399.99, 'https://www.ozeco.co.uk/cdn/shop/files/22c1e2d3-5590-4728-8f2d-8e3a1eee25a6.jpg?v=1747601508&width=533', ARRAY['/products/dyu-d3f/1.jpg','/products/dyu-d3f/2.jpg','/products/dyu-d3f/3.jpg','/products/dyu-d3f/4.jpg','/products/dyu-d3f/5.jpg','/products/dyu-d3f/6.jpg'], 'Electric Folding Bikes', false, 0, false, '250W', '36V 10Ah', '40 km', '25 km/h', NULL, NULL, '5''1" - 5''11" (155-180 cm)', ARRAY['250W Motor','Foldable Design','14 Inch Wheels','Lightweight Frame']),
('Duotts C29 Electric Bike', 'Duotts', 'duotts-c29', 'High-performance mountain Electric bike with impressive range.', 684.99, 704.99, 'https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533', ARRAY['/products/duotts-c29/1.png','/products/duotts-c29/2.png','/products/duotts-c29/3.png','/products/duotts-c29/4.png','/products/duotts-c29/5.png','/products/duotts-c29/6.png','/products/duotts-c29/7.png','/products/duotts-c29/8.png'], 'Mountain', true, 10, false, '500W', '48V 15Ah', '80 km', '25 km/h', NULL, NULL, '5''7" - 6''7" (170-200 cm)', ARRAY['500W Motor','Front Suspension','29 Inch Wheels','Mechanical Disc Brakes']),
('Duotts S26 Electric Bike', 'Duotts', 'duotts-s26', 'Premium mountain Electric bike with advanced suspension system.', 1099.00, 1119.00, 'https://www.ozeco.co.uk/cdn/shop/files/fjetvtsr.png?v=1747603276&width=533', ARRAY['/products/duotts-s26/1.png','/products/duotts-s26/2.png','/products/duotts-s26/3.png','/products/duotts-s26/4.png','/products/duotts-s26/5.png','/products/duotts-s26/6.png','/products/duotts-s26/7.png','/products/duotts-s26/8.png'], 'Mountain', true, 12, false, '750W', '48V 17.5Ah', '90 km', '28 mph', NULL, NULL, '5''7" - 6''7" (170-200 cm)', ARRAY['750W Motor','Full Suspension','26 Inch Fat Tires','Hydraulic Brakes']),
('Fiido D3 Pro', 'Fiido', 'fiido-d3-pro', 'Budget-friendly folding Electric bike perfect for short commutes.', 359.99, 379.99, 'https://www.ozeco.co.uk/cdn/shop/files/90049290-9427-4A46-BF7D-27568625A99B.jpg?v=1753272803&width=533', ARRAY['/products/fiido-d3-pro/1.jpg','/products/fiido-d3-pro/2.jpg','/products/fiido-d3-pro/3.jpg','/products/fiido-d3-pro/4.jpg'], 'Electric Folding Bikes', false, 0, false, '250W', '36V 7.8Ah', '35 km', '25 km/h', NULL, NULL, '4''11" - 6''1" (150-185 cm)', ARRAY['250W Motor','Ultra Compact','Quick Fold','LED Display']),
('Touroll B1 Electric Bike', 'Touroll', 'touroll-b1', 'Stylish city Electric bike with modern design and reliable performance.', 529.99, 549.99, 'https://www.ozeco.co.uk/cdn/shop/files/rmvdgprc.png?v=1747599362&width=533', ARRAY['/products/touroll-b1/1.png','/products/touroll-b1/2.png','/products/touroll-b1/3.png','/products/touroll-b1/4.jpg','/products/touroll-b1/5.jpg','/products/touroll-b1/6.jpg','/products/touroll-b1/7.png','/products/touroll-b1/8.png'], 'Electric City Bikes', false, 0, false, '250W', '36V 10.4Ah', '60 km', '25 km/h', NULL, NULL, '5''1" - 6''5" (155-195 cm)', ARRAY['250W Motor','Integrated Lights','Comfort Geometry','7-Speed Gears']),
('Touroll J1 Electric Bike', 'Touroll', 'touroll-j1', 'Premium commuter Electric bike with excellent battery life.', 599.99, 619.99, 'https://www.ozeco.co.uk/cdn/shop/files/701w2hia.png?v=1747599795&width=533', ARRAY['/products/touroll-j1/1.png','/products/touroll-j1/2.png','/products/touroll-j1/3.png','/products/touroll-j1/4.png','/products/touroll-j1/5.png','/products/touroll-j1/6.png','/products/touroll-j1/7.png','/products/touroll-j1/8.png'], 'Electric Commuter Bikes', false, 0, false, '350W', '36V 12.8Ah', '75 km', '25 km/h', NULL, NULL, '5''3" - 6''7" (160-200 cm)', ARRAY['350W Motor','Long Range','Hydraulic Brakes','Smart Display']),
('Touroll J1 ST Electric Bike', 'Touroll', 'touroll-j1-st', 'Step-through commuter Electric bike for easy mounting and comfort.', 619.99, 639.99, 'https://www.ozeco.co.uk/cdn/shop/files/zxhmyfkz.png?v=1747600071&width=533', ARRAY['/products/touroll-j1-st/1.png','/products/touroll-j1-st/2.png','/products/touroll-j1-st/3.png','/products/touroll-j1-st/4.png','/products/touroll-j1-st/5.png','/products/touroll-j1-st/6.png','/products/touroll-j1-st/7.png','/products/touroll-j1-st/8.png'], 'Electric Commuter Bikes', false, 0, false, '350W', '36V 12.8Ah', '75 km', '25 km/h', NULL, NULL, '5''1" - 6''5" (155-195 cm)', ARRAY['350W Motor','Step-Through Frame','Comfort Saddle','Integrated Rack']),
('Touroll U1 Electric Bike', 'Touroll', 'touroll-u1', 'Versatile mountain Electric bike for trails and city riding.', 509.99, 529.99, 'https://www.ozeco.co.uk/cdn/shop/files/touroll-u1-26-inch-off-road-tire-electric-bike-uk-pogo-cycles-3.jpg?v=1747599446&width=533', ARRAY['/products/touroll-u1/1.jpg','/products/touroll-u1/2.png','/products/touroll-u1/3.png','/products/touroll-u1/4.jpg','/products/touroll-u1/5.jpg','/products/touroll-u1/6.jpg','/products/touroll-u1/7.jpg','/products/touroll-u1/8.jpg'], 'Mountain', false, 0, false, '350W', '36V 10Ah', '65 km', '25 km/h', NULL, NULL, '5''1" - 6''3" (155-190 cm)', ARRAY['350W Motor','26 Inch Tires','Front Suspension','7-Speed Shimano'])
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  stock_quantity = EXCLUDED.stock_quantity,
  is_bestseller = EXCLUDED.is_bestseller,
  in_stock = EXCLUDED.in_stock;
`;

    console.log('📦 Inserting all 16 products...');
    await pool.query(allProducts);
    console.log('✅ All products inserted successfully!');

    // Verify the count
    const result = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`\n🎉 Production database populated!`);
    console.log(`📊 Total products in production: ${result.rows[0].count}`);
    console.log('\n✨ Your website at www.ozeco.co.uk should now display products!');
    console.log('🔄 If not showing immediately, wait 1-2 minutes for deployment to refresh.');
    
  } catch (error: any) {
    console.error('❌ Error populating production database:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
copyToProduction().catch(console.error);
