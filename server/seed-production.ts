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
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1' || process.env.NODE_ENV === 'production';
  console.log('🔍 Seed check - REPLIT_DEPLOYMENT:', process.env.REPLIT_DEPLOYMENT, 'NODE_ENV:', process.env.NODE_ENV);
  
  if (!isProduction) {
    console.log('⏭️  Skipping seed - not in production mode');
    return;
  }

  try {
    console.log('🔄 Checking if production database needs seeding...');
    
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length > 0) {
      console.log('✅ Products already exist - skipping seed');
      return;
    }

    console.log('📦 Production database empty - loading JSON data files...\n');

    // Load JSON files asynchronously from server/data directory
    const dataDir = path.join(process.cwd(), 'server', 'data');
    
    const [productsRaw, reviewsRaw, photosRaw] = await Promise.all([
      fs.promises.readFile(path.join(dataDir, 'products.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'reviews.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'customer-photos.json'), 'utf-8')
    ]);
    
    const productsData = JSON.parse(productsRaw);
    const reviewsData = JSON.parse(reviewsRaw);
    const photosData = JSON.parse(photosRaw);

    console.log(`📊 Loaded:`);
    console.log(`   - ${productsData.length} products`);
    console.log(`   - ${reviewsData.length} reviews`);
    console.log(`   - ${photosData.length} customer photos\n`);

    // Step 1: Insert all products (strip auto-generated fields)
    console.log('📦 Inserting all 16 products...');
    const productsToInsert = productsData.map((p: any) => {
      const { id, createdAt, ...rest } = p;
      return rest;
    });
    
    await db.insert(products).values(productsToInsert as any);
    console.log(`   ✅ Inserted ${productsToInsert.length} products\n`);

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

    // Step 3: Insert reviews in batches (strip IDs, remap productId)
    console.log('⭐ Inserting all reviews in batches of 100...');
    const BATCH_SIZE = 100;
    let totalInserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < reviewsData.length; i += BATCH_SIZE) {
      const batch = reviewsData.slice(i, i + BATCH_SIZE);
      const reviewsToInsert = batch
        .map((r: any) => {
          const { id, createdAt, productId: oldProductId, ...rest } = r;
          const newProductId = oldToNewId[oldProductId];
          
          if (!newProductId) {
            skipped++;
            return null;
          }
          
          return {
            ...rest,
            productId: newProductId
          };
        })
        .filter(Boolean);
      
      if (reviewsToInsert.length > 0) {
        await db.insert(reviews).values(reviewsToInsert as any);
        totalInserted += reviewsToInsert.length;
        
        if (i % 500 === 0 || i + BATCH_SIZE >= reviewsData.length) {
          console.log(`   📝 Progress: ${totalInserted}/${reviewsData.length} reviews`);
        }
      }
    }
    console.log(`   ✅ Inserted ${totalInserted} reviews (${skipped} orphaned, skipped)\n`);

    // Step 4: Insert customer photos (strip IDs, remap productId)
    console.log('📸 Inserting all customer photos...');
    const photosToInsert = photosData
      .map((p: any) => {
        const { id, createdAt, productId: oldProductId, ...rest } = p;
        const newProductId = oldToNewId[oldProductId];
        
        if (!newProductId) return null;
        
        return {
          ...rest,
          productId: newProductId
        };
      })
      .filter(Boolean);
    
    if (photosToInsert.length > 0) {
      await db.insert(customerPhotos).values(photosToInsert as any);
      console.log(`   ✅ Inserted ${photosToInsert.length} customer photos\n`);
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

  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('❌ PRODUCTION SEED FAILED');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.error('═══════════════════════════════════════════════\n');
    // Don't throw - allow app to continue
  }
}
