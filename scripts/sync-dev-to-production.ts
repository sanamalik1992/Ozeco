import { db } from '../db/index';
import { products, reviews, customerPhotos } from '../shared/schema';

/**
 * Complete sync of development database to production
 * Copies all products, reviews, and customer photos
 */
async function syncToProduction() {
  console.log('🔄 Syncing development data to production database...\n');

  try {
    // Get all data from development database (current connection)
    console.log('📊 Reading development database...');
    const devProducts = await db.select().from(products);
    const devReviews = await db.select().from(reviews);
    const devPhotos = await db.select().from(customerPhotos);

    console.log(`  ✓ Found ${devProducts.length} products`);
    console.log(`  ✓ Found ${devReviews.length} reviews`);
    console.log(`  ✓ Found ${devPhotos.length} customer photos\n`);

    if (devProducts.length === 0) {
      console.error('❌ No products found in development database!');
      process.exit(1);
    }

    // Clear production data
    console.log('🗑️  Clearing production database...');
    await db.delete(customerPhotos);
    await db.delete(reviews);
    await db.delete(products);
    console.log('  ✓ Production database cleared\n');

    // Insert products
    console.log('📦 Inserting products...');
    await db.insert(products).values(devProducts);
    console.log(`  ✓ Inserted ${devProducts.length} products\n`);

    // Insert reviews
    console.log('⭐ Inserting reviews...');
    await db.insert(reviews).values(devReviews);
    console.log(`  ✓ Inserted ${devReviews.length} reviews\n`);

    // Insert customer photos
    console.log('📸 Inserting customer photos...');
    await db.insert(customerPhotos).values(devPhotos);
    console.log(`  ✓ Inserted ${devPhotos.length} customer photos\n`);

    // Verify
    const prodProducts = await db.select().from(products);
    const prodReviews = await db.select().from(reviews);
    const prodPhotos = await db.select().from(customerPhotos);

    console.log('✅ SYNC COMPLETE!\n');
    console.log('Production Database:');
    console.log(`  Products: ${prodProducts.length}`);
    console.log(`  Reviews: ${prodReviews.length}`);
    console.log(`  Customer Photos: ${prodPhotos.length}\n`);
    console.log('🎉 Your production database now matches development!');
    console.log('🚀 Republish to ozeco.co.uk to see the changes.');

  } catch (error) {
    console.error('\n❌ Error syncing to production:');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

syncToProduction();
