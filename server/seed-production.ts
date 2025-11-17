import { db } from '@db';
import { products, reviews, customerPhotos } from '@shared/schema';
import { seedProducts } from './seed-data-products';
import { seedReviews } from './seed-data-reviews';
import { seedCustomerPhotos } from './seed-data-customer-photos';
import { eq } from 'drizzle-orm';

/**
 * Auto-seeds production database with ALL development data if empty
 * Data is imported from TypeScript modules (bundled with deployment)
 * Handles ID mapping between products and reviews/photos
 * Only runs in production mode (Replit deployment)
 */
export async function seedProductionIfEmpty() {
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || process.env.NODE_ENV === 'production';
  console.log('🔍 Seed check - REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT, 'NODE_ENV:', process.env.NODE_ENV);
  
  // Only run in production
  if (!isProduction) {
    console.log('⏭️  Skipping seed - not in production mode');
    return;
  }

  try {
    console.log('🔄 Checking if production database needs seeding...');
    
    // Check if products already exist
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length > 0) {
      console.log('✅ Products already exist - skipping seed');
      return;
    }

    console.log('📦 Production database empty - loading development data...\n');
    console.log(`📊 Data to insert:`);
    console.log(`   - ${seedProducts.length} products`);
    console.log(`   - ${seedReviews.length} reviews`);
    console.log(`   - ${seedCustomerPhotos.length} customer photos\n`);

    // Create ID mapping for reviews and photos
    const oldToNewProductIds: Record<string, string> = {};

    // Insert products without id and createdAt (let DB generate them)
    console.log('📦 Inserting all products...');
    const productsToInsert = seedProducts.map((p: any) => {
      const { id: oldId, createdAt, ...rest } = p;
      oldToNewProductIds[oldId] = p.slug; // Map old ID to slug temporarily
      return rest;
    });
    
    await db.insert(products).values(productsToInsert as any);
    console.log(`   ✅ Inserted ${productsToInsert.length} products\n`);

    // Query back to get new product IDs by slug
    console.log('🔗 Mapping product IDs...');
    const insertedProducts = await db.select().from(products);
    const slugToNewId: Record<string, string> = {};
    
    insertedProducts.forEach(p => {
      slugToNewId[p.slug] = p.id;
    });

    // Map old product IDs to new IDs
    for (const [oldId, slug] of Object.entries(oldToNewProductIds)) {
      oldToNewProductIds[oldId] = slugToNewId[slug as string];
    }
    console.log(`   ✅ Mapped ${Object.keys(oldToNewProductIds).length} product IDs\n`);

    // Insert reviews in batches with corrected product IDs
    console.log('⭐ Inserting reviews in batches...');
    const BATCH_SIZE = 200;
    const totalReviews = seedReviews.length;
    let inserted = 0;
    
    for (let i = 0; i < totalReviews; i += BATCH_SIZE) {
      const batch = seedReviews.slice(i, i + BATCH_SIZE).map((r: any) => {
        const { id, createdAt, productId: oldProductId, ...rest } = r;
        const newProductId = oldToNewProductIds[oldProductId];
        
        // Skip reviews for products that don't exist
        if (!newProductId) return null;
        
        return {
          ...rest,
          productId: newProductId
        };
      }).filter(Boolean); // Remove null entries
      
      if (batch.length > 0) {
        await db.insert(reviews).values(batch as any);
        inserted += batch.length;
        console.log(`   📝 Progress: ${inserted}/${totalReviews} reviews`);
      }
    }
    console.log(`   ✅ Inserted ${inserted} reviews\n`);

    // Insert customer photos with corrected product IDs
    console.log('📸 Inserting customer photos...');
    const photosToInsert = seedCustomerPhotos.map((p: any) => {
      const { id, createdAt, productId: oldProductId, ...rest } = p;
      const newProductId = oldToNewProductIds[oldProductId];
      
      // Skip photos for products that don't exist
      if (!newProductId) return null;
      
      return {
        ...rest,
        productId: newProductId
      };
    }).filter(Boolean);
    
    if (photosToInsert.length > 0) {
      await db.insert(customerPhotos).values(photosToInsert as any);
      console.log(`   ✅ Inserted ${photosToInsert.length} customer photos\n`);
    }

    console.log('═══════════════════════════════════════════════');
    console.log('✅ PRODUCTION DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Total Data:`);
    console.log(`   • ${productsToInsert.length} Products`);
    console.log(`   • ${inserted} Reviews`);
    console.log(`   • ${photosToInsert.length} Customer Photos`);
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 www.ozeco.co.uk is now ready!');
    console.log('🚀 All features should work exactly like development');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('❌ FAILED TO SEED PRODUCTION DATABASE');
    console.error('═══════════════════════════════════════════════');
    console.error('Error details:', error);
    console.error('═══════════════════════════════════════════════\n');
    // Don't throw - allow app to continue starting
  }
}
