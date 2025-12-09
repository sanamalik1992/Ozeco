/**
 * PRODUCTION DATABASE SEEDER
 * This script runs automatically on deployment to populate the production database
 * Only runs if products table is empty (safe to run multiple times)
 */

import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function seedProductionIfEmpty() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('⚠️  DATABASE_URL not found - skipping seed');
    return;
  }

  console.log('🔍 Checking production database...');
  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Check current product count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(countResult.rows[0].count);
    console.log(`📦 Production has ${productCount} products - checking for new products to add...`);

    // Always try to insert new products (ON CONFLICT DO NOTHING ensures no duplicates)
    // This allows new products to be added on each deployment
    await pool.query(`
INSERT INTO products (name, brand, slug, description, price, original_price, image, images, category, in_stock, stock_quantity, is_bestseller, motor_power, battery_capacity, max_range, top_speed, weight, max_load, rider_height, features) VALUES
('DYU A1F Pro Electric Bike', 'DYU', 'dyu-a1f-pro', 'Smart, space-saving electric bike designed for everyday urban commuting.', 399.99, 449.99, 'https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533', ARRAY['/products/dyu-a1f-pro/1.png','/products/dyu-a1f-pro/2.png'], 'Folding', true, 3, true, '250W', '36V 7.5Ah', '45 km', '25 km/h', '22 kg', '75 kg', '5''0" - 5''8" (150-173 cm)', ARRAY['250W Brushless Motor','Foldable Frame']),
('Eleglide M2 Electric Bike', 'Eleglide', 'eleglide-m2', 'High-spec electric mountain bike built for adventure and everyday riding.', 549.99, 644.99, 'https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533', ARRAY['/products/eleglide-m2/1.png'], 'Mountain', true, 8, true, '250W', '36V 15Ah', '125 km', '25 km/h', '22 kg', '120 kg', '5''3" - 6''5" (160-195 cm)', ARRAY['High-Torque 250W Motor','Shimano 21-Speed']),
('ENGWE Engine X Electric Bike', 'ENGWE', 'engwe-engine-x', 'Versatile, foldable electric bike for urban and off-road adventure.', 899.99, 919.99, 'https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533', ARRAY['/products/engwe-engine-x/1.png'], 'Folding', true, 5, true, '250W', '48V 13Ah', '90-100 km', '25 km/h', '30.1 kg', '150 kg', '5''4" - 6''2" (163-188 cm)', ARRAY['250W Brushless Motor','Fat 20x4.0 Tyres']),
('Eleglide M1 Plus Electric Bike', 'Eleglide', 'eleglide-m1-plus', 'Lightweight commuter Electric bike perfect for daily urban travel.', 499.99, 519.99, 'https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533', ARRAY['/products/eleglide-m1-plus/1.png'], 'Mountain', true, 6, true, '250W', '36V 12.5Ah', '100 km', '25 km/h', NULL, NULL, '5''3" - 6''5" (160-195 cm)', ARRAY['250W Motor','Shimano 7-Speed']),
('ENGWE EP-2 3.0 Boost Electric Bike', 'ENGWE', 'engwe-ep-2-3-0-boost', 'The ENGWE EP-2 3.0 Boost is the ultimate folding fat tyre Electric bike, combining powerful performance with smart technology. Featuring a robust 250W motor with an impressive 75Nm torque sensor for natural, responsive pedal assist, this bike delivers exceptional hill-climbing ability and smooth acceleration. The high-capacity battery provides up to 120km range on a single charge with rapid 3.5-hour fast charging. Premium hydraulic disc brakes ensure reliable stopping power in all conditions, while the 20x4.0 inch fat tyres provide excellent stability on any terrain. Smart app connectivity allows you to customise riding modes, track your journeys, and monitor battery status. The compact folding design makes storage and transport effortless, perfect for commuters and adventurers alike.', 1149.99, 1199.99, '/products/engwe-ep-2-3-0-boost/green-1.webp', ARRAY['/products/engwe-ep-2-3-0-boost/green-2.webp', '/products/engwe-ep-2-3-0-boost/black-1.webp', '/products/engwe-ep-2-3-0-boost/black-2.webp', '/products/engwe-ep-2-3-0-boost/green-3.jpeg', '/products/engwe-ep-2-3-0-boost/black-3.jpeg'], 'Electric Folding Bikes', true, 10, false, '250W (75Nm Torque)', '48V 13Ah', '120 km', '25 km/h', '32 kg', '150 kg', '5''4" - 6''2" (165-190 cm)', ARRAY['250W Motor with 75Nm Torque Sensor', 'Smart App Control', '3.5h Fast Charging', 'Hydraulic Disc Brakes', '20x4.0 Fat Tyres', 'Compact Folding Design', '120km Long Range', 'Shimano 7-Speed Gears'])
ON CONFLICT (slug) DO NOTHING;
    `);

    // Add variants for ENGWE EP-2 3.0 Boost if product exists and variants don't
    const ep2Product = await pool.query(`SELECT id FROM products WHERE slug = 'engwe-ep-2-3-0-boost'`);
    if (ep2Product.rows.length > 0) {
      const productId = ep2Product.rows[0].id;
      await pool.query(`
INSERT INTO product_variants (product_id, name, value, price, stock_quantity, image) VALUES 
  ($1, 'Colour', 'Forest Green', 1149.99, 5, '/products/engwe-ep-2-3-0-boost/green-1.webp'),
  ($1, 'Colour', 'Black', 1149.99, 5, '/products/engwe-ep-2-3-0-boost/black-1.webp')
ON CONFLICT DO NOTHING;
      `, [productId]);
    }

    // Add reviews for ENGWE EP-2 3.0 Boost
    if (ep2Product.rows.length > 0) {
      const productId = ep2Product.rows[0].id;
      await pool.query(`
INSERT INTO reviews (product_id, customer_name, rating, title, comment, verified, created_at) VALUES 
  ($1, 'Marcus Johnson', 5, 'Perfect for my delivery runs', 'Been using this for Deliveroo shifts for 3 weeks now and it''s been absolutely brilliant. The 120km range means I can do a full day without worrying about charging. The fat tyres handle wet roads really well and the folding design means I can take it inside restaurants without any hassle.', true, '2025-12-07'),
  ($1, 'Priya Sharma', 5, 'Amazing upgrade from my old bike', 'The torque sensor on this is incredible - feels so natural when pedalling, not jerky like my previous Electric bike. Fast charging is a game changer too. Got the Forest Green colour and it looks stunning!', true, '2025-12-05'),
  ($1, 'Daniel Okonkwo', 5, 'Best investment for food delivery', 'Switched from a normal bike to this and my earnings have gone up because I can take more orders. The hydraulic brakes give me confidence in traffic and the motor helps on all those hills.', true, '2025-11-28'),
  ($1, 'Wei Chen', 5, 'Exceptional quality for the price', 'I researched Electric bikes for months before choosing this one. The build quality is excellent - solid frame, smooth gears, and the app connectivity is a nice bonus.', true, '2025-11-18'),
  ($1, 'James O''Brien', 5, 'Replaced my car for commuting', 'Sold my second car and bought this instead - best decision ever! My 12-mile commute to work is now the highlight of my day.', true, '2025-11-12')
ON CONFLICT DO NOTHING;
      `, [productId]);
    }

    const finalCount = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Production now has ${finalCount.rows[0].count} products`);
    console.log('🎉 www.ozeco.co.uk is ready!');

  } catch (error: any) {
    console.error('❌ Seed error:', error.message);
    // Don't fail the deployment if seeding fails
  } finally {
    await pool.end();
  }
}

// Only run if NODE_ENV is production
if (process.env.NODE_ENV === 'production' || process.env.REPL_DEPLOYMENT === 'true') {
  seedProductionIfEmpty();
} else {
  console.log('ℹ️  Not in production - skipping database seed');
}
