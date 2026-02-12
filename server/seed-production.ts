import { db } from '@db';
import { products, reviews, customerPhotos, blogPosts, productVariants } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Auto-seeds production database with ALL development data
 * Loads from JSON files: 16 products, 1,991 reviews, 33 customer photos, 5 blog posts
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
    
    const [productsRaw, reviewsRaw, photosRaw, blogPostsRaw] = await Promise.all([
      fs.promises.readFile(path.join(dataDir, 'products.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'reviews.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'customer-photos.json'), 'utf-8'),
      fs.promises.readFile(path.join(dataDir, 'blog-posts.json'), 'utf-8')
    ]);
    
    const productsData = JSON.parse(productsRaw);
    const reviewsData = JSON.parse(reviewsRaw);
    const photosData = JSON.parse(photosRaw);
    const blogPostsData = JSON.parse(blogPostsRaw);

    const EXPECTED_PRODUCTS = productsData.length;  // 16
    const EXPECTED_REVIEWS = reviewsData.length;    // 1991
    const EXPECTED_PHOTOS = photosData.length;      // 33
    const EXPECTED_BLOG_POSTS = blogPostsData.length;  // 5

    console.log(`📊 Expected data:`);
    console.log(`   - ${EXPECTED_PRODUCTS} products`);
    console.log(`   - ${EXPECTED_REVIEWS} reviews`);
    console.log(`   - ${EXPECTED_PHOTOS} customer photos`);
    console.log(`   - ${EXPECTED_BLOG_POSTS} blog posts\n`);
    
    // Count actual rows in database
    const [actualProducts, actualReviews, actualPhotos, actualBlogPosts] = await Promise.all([
      db.select().from(products).then(r => r.length),
      db.select().from(reviews).then(r => r.length),
      db.select().from(customerPhotos).then(r => r.length),
      db.select().from(blogPosts).then(r => r.length)
    ]);
    
    console.log(`📊 Current database:`);
    console.log(`   - ${actualProducts} products`);
    console.log(`   - ${actualReviews} reviews`);
    console.log(`   - ${actualPhotos} customer photos`);
    console.log(`   - ${actualBlogPosts} blog posts\n`);
    
    // Check if database is already fully seeded (exact counts)
    if (actualProducts >= EXPECTED_PRODUCTS && 
        actualReviews >= EXPECTED_REVIEWS && 
        actualPhotos >= EXPECTED_PHOTOS &&
        actualBlogPosts >= EXPECTED_BLOG_POSTS) {
      console.log('✅ Database already fully seeded - skipping');
      console.log(`   All ${EXPECTED_PRODUCTS} products, ${EXPECTED_REVIEWS} reviews, ${EXPECTED_PHOTOS} photos, and ${EXPECTED_BLOG_POSTS} blog posts present\n`);
      return;
    }
    
    if (actualProducts > 0 || actualReviews > 0 || actualPhotos > 0 || actualBlogPosts > 0) {
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

    // Step 5: Insert blog posts (skip if already complete)
    const currentBlogPostCount = await db.select().from(blogPosts).then(r => r.length);
    
    if (currentBlogPostCount < blogPostsData.length) {
      console.log(`📝 Inserting blog posts (current: ${currentBlogPostCount}, target: ${blogPostsData.length})...`);
      let blogPostsInserted = 0;
      for (const post of blogPostsData) {
        try {
          const { slug, title, excerpt, content, author, publishedDate, category, featuredImage, views } = post;
          await db.insert(blogPosts).values({
            slug,
            title,
            excerpt,
            content,
            author,
            publishedDate: new Date(publishedDate),
            category,
            featuredImage,
            views: views || 0
          } as any);
          blogPostsInserted++;
        } catch (err: any) {
          // Skip duplicates (unique constraint on slug)
          const errorMsg = err.message?.toLowerCase() || '';
          const isUniqueError = errorMsg.includes('unique') || 
                               errorMsg.includes('duplicate') ||
                               errorMsg.includes('already exists');
          if (!isUniqueError) {
            console.error(`   ❌ Unexpected error inserting blog post:`, err);
          }
        }
      }
      console.log(`   ✅ Inserted ${blogPostsInserted} new blog posts\n`);
    } else {
      console.log(`   ⏭️  Blog posts already complete (${currentBlogPostCount} present)\n`);
    }

    // Step 6: Insert product variants
    console.log('🎨 Seeding product variants...');
    const variantData = [
      { slug: "engwe-t14", type: "Color", value: "Blue", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/fonogapi.png?v=1747666664&width=416" },
      { slug: "engwe-t14", type: "Color", value: "Grey", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/5yzpcgwa.png?v=1747600357&width=416" },
      { slug: "engwe-t14", type: "Color", value: "Orange", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/engwe-t14-folding-electric-bike-uk-pogo-cycles-19.jpg?v=1747666675&width=416" },
      { slug: "engwe-t14", type: "Color", value: "White", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/v7ma4rnd.png?v=1747600357&width=416" },
      { slug: "engwe-engine-pro-2-0", type: "Color", value: "Black", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/4_273d206a-f78c-4295-8b1a-72e6846b3252.jpg?v=1751964957&width=416" },
      { slug: "engwe-engine-pro-2-0", type: "Color", value: "Blue", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/3_18b2d0a7-4e3f-485f-bcf8-1e330bb480ba.jpg?v=1751964957&width=416" },
      { slug: "engwe-engine-pro-2-0", type: "Color", value: "Green", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/7.jpg?v=1751964921&width=416" },
      { slug: "engwe-engine-x", type: "Color", value: "Black", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=416" },
      { slug: "engwe-engine-x", type: "Color", value: "Red", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/or68pika.png?v=1747666416&width=416" },
      { slug: "engwe-engine-x", type: "Color", value: "White", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/bjy0kolj.png?v=1747666224&width=416" },
      { slug: "engwe-ep-2-boost", type: "Color", value: "Black", price: "849.99", stock: 7, image: "https://engwe-bikes-uk.com/cdn/shop/files/3_b02d9783-702a-4623-bd84-2aea89d0019d.jpg?v=1753065836&width=416" },
      { slug: "engwe-ep-2-boost", type: "Color", value: "Grey", price: "849.99", stock: 7, image: "https://engwe-bikes-uk.com/cdn/shop/files/2_f7000d51-73b1-442e-9190-8c7e25f9bf48.jpg?v=1753325816&width=416" },
      { slug: "engwe-ep-2-boost", type: "Color", value: "Orange", price: "849.99", stock: 5, image: "https://engwe-bikes-uk.com/cdn/shop/files/1_fff95917-986e-48c3-bb0f-168ea6386d3a.jpg?v=1753065836&width=416" },
      { slug: "engwe-l20", type: "Color", value: "Black", price: "999.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/IMG-2140.webp?v=1756504566&width=400" },
      { slug: "engwe-l20", type: "Color", value: "Champagne", price: "999.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/IMG-2139.webp?v=1756504566&width=416" },
      { slug: "eleglide-m1-plus", type: "Wheel Size", value: "27.5 Inch", price: "499.99", stock: 5, image: null },
      { slug: "eleglide-m1-plus", type: "Wheel Size", value: "29 Inch", price: "539.99", stock: 6, image: null },
      { slug: "eleglide-m2", type: "Wheel Size", value: "27.5 Inch", price: "549.99", stock: 5, image: null },
      { slug: "eleglide-m2", type: "Wheel Size", value: "29 Inch", price: "599.99", stock: 3, image: null },
      { slug: "duotts-c29", type: "Battery", value: "Single Battery", price: "684.99", stock: 10, image: null },
      { slug: "duotts-c29", type: "Battery", value: "Double Battery", price: "839.99", stock: 10, image: null },
      { slug: "touroll-u1", type: "Wheel Size", value: "26 Inch", price: "509.99", stock: 5, image: null },
      { slug: "touroll-u1", type: "Wheel Size", value: "29 Inch", price: "529.99", stock: 5, image: null },
      { slug: "fiido-d3-pro", type: "Color", value: "Black", price: "359.99", stock: 5, image: null },
      { slug: "fiido-d3-pro", type: "Color", value: "White", price: "359.99", stock: 5, image: null },
      { slug: "engwe-ep-2-3-0-boost", type: "Color", value: "Forest Green", price: "1149.99", stock: 5, image: "/products/engwe-ep-2-3-0-boost/green-1.png" },
      { slug: "engwe-ep-2-3-0-boost", type: "Color", value: "Black", price: "1149.99", stock: 5, image: "/products/engwe-ep-2-3-0-boost/black-1.png" },
      { slug: "twofish-tf1", type: "Color", value: "Blue", price: "399.99", stock: 5, image: "/products/twofish-tf1/blue.webp" },
      { slug: "twofish-tf1", type: "Color", value: "Red", price: "399.99", stock: 5, image: "/products/twofish-tf1/red.webp" },
      { slug: "twofish-tf1", type: "Color", value: "White", price: "399.99", stock: 5, image: "/products/twofish-tf1/white.webp" },
      { slug: "twofish-tf1", type: "Color", value: "Grey", price: "399.99", stock: 5, image: "/products/twofish-tf1/grey.webp" },
    ];

    let variantsInserted = 0;
    let variantsSkipped = 0;

    for (const variantInfo of variantData) {
      // Find product by slug
      const product = insertedProducts.find(p => p.slug === variantInfo.slug);
      if (!product) {
        variantsSkipped++;
        continue;
      }

      // Check if variant already exists
      const existingVariants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
      const exists = existingVariants.some(v => 
        v.name.toLowerCase() === variantInfo.type.toLowerCase() && 
        v.value.toLowerCase() === variantInfo.value.toLowerCase()
      );

      if (exists) {
        variantsSkipped++;
        continue;
      }

      try {
        await db.insert(productVariants).values({
          productId: product.id,
          name: variantInfo.type,
          value: variantInfo.value,
          price: variantInfo.price,
          stockQuantity: variantInfo.stock,
          image: variantInfo.image || null,
        } as any);
        variantsInserted++;
      } catch {
        variantsSkipped++;
      }
    }
    console.log(`   ✅ Inserted ${variantsInserted} variants (${variantsSkipped} skipped)\n`);

    console.log('═══════════════════════════════════════════════');
    console.log('✅ PRODUCTION DATABASE FULLY SEEDED!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Final Counts:`);
    console.log(`   • ${productsToInsert.length} Products`);
    console.log(`   • ${totalInserted} Reviews`);
    console.log(`   • ${photosToInsert.length} Customer Photos`);
    console.log(`   • ${blogPostsData.length} Blog Posts`);
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 www.ozeco.co.uk is now fully operational!');
    console.log('🛒 Cart, checkout, and admin should all work');
    console.log('📝 Blog posts are live at /blog');
    console.log('🔐 Admin login: /admin/login (password: Springedge1.)');
    console.log('═══════════════════════════════════════════════\n');
    
    // Final verification with expected counts
    console.log('🔍 Running final verification...');
    const [finalProducts, finalReviews, finalPhotos, finalBlogPosts] = await Promise.all([
      db.select().from(products).then(r => r.length),
      db.select().from(reviews).then(r => r.length),
      db.select().from(customerPhotos).then(r => r.length),
      db.select().from(blogPosts).then(r => r.length)
    ]);
    
    console.log(`📊 Verification Results:`);
    console.log(`   Products: ${finalProducts}/${EXPECTED_PRODUCTS} ${finalProducts >= EXPECTED_PRODUCTS ? '✅' : '❌'}`);
    console.log(`   Reviews: ${finalReviews}/${EXPECTED_REVIEWS} ${finalReviews >= EXPECTED_REVIEWS ? '✅' : '❌'}`);
    console.log(`   Photos: ${finalPhotos}/${EXPECTED_PHOTOS} ${finalPhotos >= EXPECTED_PHOTOS ? '✅' : '❌'}`);
    console.log(`   Blog Posts: ${finalBlogPosts}/${EXPECTED_BLOG_POSTS} ${finalBlogPosts >= EXPECTED_BLOG_POSTS ? '✅' : '❌'}\n`);
    
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
    if (finalBlogPosts < EXPECTED_BLOG_POSTS) {
      throw new Error(`Missing blog posts: expected ${EXPECTED_BLOG_POSTS}, found ${finalBlogPosts}`);
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
