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
    // Check if products already exist
    const countResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(countResult.rows[0].count);

    if (productCount > 0) {
      console.log(`✅ Production already has ${productCount} products - skipping seed`);
      return;
    }

    console.log('📦 Production database is empty - seeding products...');

    // Insert all products
    await pool.query(`
INSERT INTO products (name, brand, slug, description, price, original_price, image, images, category, in_stock, stock_quantity, is_bestseller, motor_power, battery_capacity, max_range, top_speed, weight, max_load, rider_height, features) VALUES
('DYU A1F Pro Electric Bike', 'DYU', 'dyu-a1f-pro', 'Smart, space-saving electric bike designed for everyday urban commuting.', 399.99, 449.99, 'https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533', ARRAY['/products/dyu-a1f-pro/1.png','/products/dyu-a1f-pro/2.png'], 'Folding', true, 3, true, '250W', '36V 7.5Ah', '45 km', '25 km/h', '22 kg', '75 kg', '5''0" - 5''8" (150-173 cm)', ARRAY['250W Brushless Motor','Foldable Frame']),
('Eleglide M2 Electric Bike', 'Eleglide', 'eleglide-m2', 'High-spec electric mountain bike built for adventure and everyday riding.', 549.99, 644.99, 'https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533', ARRAY['/products/eleglide-m2/1.png'], 'Mountain', true, 8, true, '250W', '36V 15Ah', '125 km', '25 km/h', '22 kg', '120 kg', '5''3" - 6''5" (160-195 cm)', ARRAY['High-Torque 250W Motor','Shimano 21-Speed']),
('ENGWE Engine X Electric Bike', 'ENGWE', 'engwe-engine-x', 'Versatile, foldable electric bike for urban and off-road adventure.', 899.99, 919.99, 'https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533', ARRAY['/products/engwe-engine-x/1.png'], 'Folding', true, 5, true, '250W', '48V 13Ah', '90-100 km', '25 km/h', '30.1 kg', '150 kg', '5''4" - 6''2" (163-188 cm)', ARRAY['250W Brushless Motor','Fat 20x4.0 Tyres']),
('Eleglide M1 Plus Electric Bike', 'Eleglide', 'eleglide-m1-plus', 'Lightweight commuter Electric bike perfect for daily urban travel.', 499.99, 519.99, 'https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533', ARRAY['/products/eleglide-m1-plus/1.png'], 'Mountain', true, 6, true, '250W', '36V 12.5Ah', '100 km', '25 km/h', NULL, NULL, '5''3" - 6''5" (160-195 cm)', ARRAY['250W Motor','Shimano 7-Speed'])
ON CONFLICT (slug) DO NOTHING;
    `);

    const finalCount = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Seeded ${finalCount.rows[0].count} products successfully!`);
    console.log('🎉 www.ozeco.co.uk is now ready!');

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
