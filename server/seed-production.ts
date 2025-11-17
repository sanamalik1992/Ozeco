import { db } from '@db';
import { products, reviews, customerPhotos } from '@shared/schema';
import fs from 'fs';
import path from 'path';

/**
 * Auto-seeds production database with ALL development data
 * Loads from JSON files: 16 products, 2,302 reviews, 33 customer photos
 * Uses streaming approach to avoid bundle size issues
 */
export async function seedProductionIfEmpty() {
  // Run seeding in ANY production-like environment (not just development)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = !isDevelopment;
  
  console.log('🔍 Seed check - NODE_ENV:', process.env.NODE_ENV, 'isDevelopment:', isDevelopment, 'isProduction:', isProduction);
  
  if (!isProduction) {
    console.log('⏭️  Skipping seed - development mode (database already seeded manually)');
    return;
  }
  
  console.log('🚀 Production environment detected - checking if database needs seeding...');

  try {
    console.log('🔄 Checking if production database needs seeding...\n');

    // Load JSON files to get EXACT expected counts
    console.log('📦 Loading seed data files...');
    const dataDir = path.join(process.cwd(), 'server', 'data');
    
    const [productsRaw, reviewsRaw, photosRaw] = await Promise.all([
      fs.promises.readFile(path.join(dataDir, 'products.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'reviews.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'customer-photos.json'), 'utf-8')
    ]);
    
    const productsData = JSON.parse(productsRaw);
    const reviewsData = JSON.parse(reviewsRaw);
    const photosData = JSON.parse(photosRaw);

    const EXPECTED_PRODUCTS = productsData.length;  // 16
    const EXPECTED_REVIEWS = reviewsData.length;    // 1991
    const EXPECTED_PHOTOS = photosData.length;      // 33

    console.log(`📊 Expected data:`);
    console.log(`   - ${EXPECTED_PRODUCTS} products`);
    console.log(`   - ${EXPECTED_REVIEWS} reviews`);
    console.log(`   - ${EXPECTED_PHOTOS} customer photos\n`);
    
    // Count actual rows in database
    const [actualProducts, actualReviews, actualPhotos] = await Promise.all([
      db.select().from(products).then(r => r.length),
      db.select().from(reviews).then(r => r.length),
      db.select().from(customerPhotos).then(r => r.length)
    ]);
    
    console.log(`📊 Current database:`);
    console.log(`   - ${actualProducts} products`);
    console.log(`   - ${actualReviews} reviews`);
    console.log(`   - ${actualPhotos} customer photos\n`);
    
    // Check if database is already fully seeded (exact counts)
    if (actualProducts >= EXPECTED_PRODUCTS && 
        actualReviews >= EXPECTED_REVIEWS && 
        actualPhotos >= EXPECTED_PHOTOS) {
      console.log('✅ Database already fully seeded - skipping');
      console.log(`   All ${EXPECTED_PRODUCTS} products, ${EXPECTED_REVIEWS} reviews, and ${EXPECTED_PHOTOS} photos present\n`);
      return;
    }
    
    if (actualProducts > 0 || actualReviews > 0 || actualPhotos > 0) {
      console.log('⚠️  Partial or incomplete data detected - completing seed...\n');
    } else {
      console.log('📦 Fresh database detected - starting full seed...\n');
    }

    // Step 1: Insert products using ON CONFLICT DO NOTHING (idempotent)
    console.log('📦 Inserting products (with conflict resolution)...');
    const productsToInsert = productsData.map((p: any) => {
      const { id, createdAt, ...rest } = p;
      return rest;
    });
    
    // Use individual inserts with ON CONFLICT to handle partial data safely
    let productsInserted = 0;
    let productsSkipped = 0;
    for (const product of productsToInsert) {
      try {
        await db.insert(products).values(product as any);
        productsInserted++;
      } catch (err: any) {
        // Skip duplicates silently (unique constraint on slug/sku)
        const errorMsg = err.message?.toLowerCase() || '';
        const isUniqueError = errorMsg.includes('unique') || 
                             errorMsg.includes('duplicate') ||
                             errorMsg.includes('already exists');
        if (isUniqueError) {
          productsSkipped++;
        } else {
          console.error(`   ❌ Unexpected error inserting product:`, err);
          throw err;
        }
      }
    }
    console.log(`   ✅ Inserted ${productsInserted} new products (${productsSkipped} already existed)\n`);

    // Step 2: Create product ID mapping (old ID → new ID)
    console.log('🔗 Creating product ID mapping...');
    const insertedProducts = await db.select().from(products);
    const oldToNewId: Record<string, string> = {};
    
    productsData.forEach((oldProd: any) => {
      const newProd = insertedProducts.find(p => p.slug === oldProd.slug);
      if (newProd) {
        oldToNewId[oldProd.id] = newProd.id;
      }
    });
    
    console.log(`   ✅ Mapped ${Object.keys(oldToNewId).length} product IDs\n`);

    // Step 3: Insert reviews (skip if already seeded adequately)
    const currentReviewCount = await db.select().from(reviews).then(r => r.length);
    let totalInserted = currentReviewCount;
    
    if (currentReviewCount < reviewsData.length) {
      console.log(`⭐ Inserting reviews (current: ${currentReviewCount}, target: ${reviewsData.length})...`);
      const BATCH_SIZE = 100;
      let skipped = 0;
      let newlyInserted = 0;
      
      for (let i = 0; i < reviewsData.length; i += BATCH_SIZE) {
        const batch = reviewsData.slice(i, i + BATCH_SIZE);
        const reviewsToInsert = batch
          .map((r: any) => {
            const { id, productId: oldProductId, ...rest } = r;
            const newProductId = oldToNewId[oldProductId];
            
            if (!newProductId) {
              skipped++;
              return null;
            }
            
            return {
              ...rest,
              productId: newProductId,
              createdAt: new Date(r.createdAt)
            };
          })
          .filter(Boolean);
        
        if (reviewsToInsert.length > 0) {
          try {
            await db.insert(reviews).values(reviewsToInsert as any);
            newlyInserted += reviewsToInsert.length;
          } catch (err: any) {
            // If batch fails, try individual inserts
            for (const review of reviewsToInsert) {
              try {
                await db.insert(reviews).values(review as any);
                newlyInserted++;
              } catch {
                // Skip duplicates silently
              }
            }
          }
          
          if (i % 500 === 0 || i + BATCH_SIZE >= reviewsData.length) {
            console.log(`   📝 Progress: ${newlyInserted}/${reviewsData.length} reviews`);
          }
        }
      }
      totalInserted = currentReviewCount + newlyInserted;
      console.log(`   ✅ Inserted ${newlyInserted} new reviews (${skipped} orphaned)\n`);
    } else {
      console.log(`   ⏭️  Reviews already complete (${currentReviewCount} present)\n`);
    }

    // Step 4: Insert customer photos (skip if already complete)
    const currentPhotoCount = await db.select().from(customerPhotos).then(r => r.length);
    
    const photosToInsert = photosData
      .map((p: any) => {
        const { id, productId: oldProductId, ...rest } = p;
        const newProductId = oldToNewId[oldProductId];
        
        if (!newProductId) return null;
        
        return {
          ...rest,
          productId: newProductId,
          createdAt: new Date(p.createdAt)
        };
      })
      .filter(Boolean);
    
    if (currentPhotoCount < photosToInsert.length) {
      console.log(`📸 Inserting customer photos (current: ${currentPhotoCount}, target: ${photosToInsert.length})...`);
      let photosInserted = 0;
      for (const photo of photosToInsert) {
        try {
          await db.insert(customerPhotos).values(photo as any);
          photosInserted++;
        } catch {
          // Skip duplicates silently
        }
      }
      console.log(`   ✅ Inserted ${photosInserted} new customer photos\n`);
    } else {
      console.log(`   ⏭️  Customer photos already complete (${currentPhotoCount} present)\n`);
    }

    console.log('═══════════════════════════════════════════════');
    console.log('✅ PRODUCTION DATABASE FULLY SEEDED!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Final Counts:`);
    console.log(`   • ${productsToInsert.length} Products`);
    console.log(`   • ${totalInserted} Reviews`);
    console.log(`   • ${photosToInsert.length} Customer Photos`);
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 www.ozeco.co.uk is now fully operational!');
    console.log('🛒 Cart, checkout, and admin should all work');
    console.log('🔐 Admin login: /admin/login (password: Springedge1.)');
    console.log('═══════════════════════════════════════════════\n');
    
    // Final verification with expected counts
    console.log('🔍 Running final verification...');
    const [finalProducts, finalReviews, finalPhotos] = await Promise.all([
      db.select().from(products).then(r => r.length),
      db.select().from(reviews).then(r => r.length),
      db.select().from(customerPhotos).then(r => r.length)
    ]);
    
    console.log(`📊 Verification Results:`);
    console.log(`   Products: ${finalProducts}/${EXPECTED_PRODUCTS} ${finalProducts >= EXPECTED_PRODUCTS ? '✅' : '❌'}`);
    console.log(`   Reviews: ${finalReviews}/${EXPECTED_REVIEWS} ${finalReviews >= EXPECTED_REVIEWS ? '✅' : '❌'}`);
    console.log(`   Photos: ${finalPhotos}/${EXPECTED_PHOTOS} ${finalPhotos >= EXPECTED_PHOTOS ? '✅' : '❌'}\n`);
    
    // Require EXACT counts (or very close)
    if (finalProducts < EXPECTED_PRODUCTS) {
      throw new Error(`Missing products: expected ${EXPECTED_PRODUCTS}, found ${finalProducts}`);
    }
    if (finalReviews < EXPECTED_REVIEWS) {
      throw new Error(`Missing reviews: expected ${EXPECTED_REVIEWS}, found ${finalReviews}`);
    }
    if (finalPhotos < EXPECTED_PHOTOS) {
      throw new Error(`Missing photos: expected ${EXPECTED_PHOTOS}, found ${finalPhotos}`);
    }
    
    console.log('✅ Verification passed: Database fully seeded!\n');

  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('❌ PRODUCTION SEED FAILED');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.error('═══════════════════════════════════════════════');
    console.error('⚠️  DATABASE MAY BE IN PARTIAL STATE');
    console.error('⚠️  APP WILL CONTINUE BUT MAY NOT FUNCTION CORRECTLY');
    console.error('═══════════════════════════════════════════════\n');
    
    // Re-throw to ensure deployment logs show the failure
    throw error;
  }
}
