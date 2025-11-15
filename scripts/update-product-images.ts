import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

interface ProductImage {
  slug: string;
  images: string[];
}

async function main() {
  console.log('📦 Updating product images in database...\n');
  
  // Read scraped images
  const scrapedPath = join(process.cwd(), 'scripts', 'scraped-images.json');
  const scrapedData: ProductImage[] = JSON.parse(readFileSync(scrapedPath, 'utf-8'));
  
  console.log(`Found ${scrapedData.length} products with images\n`);
  
  // Connect to database
  const sql = neon(process.env.DATABASE_URL!);
  
  let updated = 0;
  let failed = 0;
  
  for (const product of scrapedData) {
    try {
      // Update the images array for this product
      await sql`
        UPDATE products 
        SET images = ${product.images}
        WHERE slug = ${product.slug}
      `;
      
      console.log(`✅ ${product.slug}: Updated with ${product.images.length} images`);
      updated++;
    } catch (error) {
      console.error(`❌ ${product.slug}: Failed to update`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated} products`);
  console.log(`   ❌ Failed: ${failed} products`);
  
  // Verify updates
  console.log(`\n🔍 Verifying updates...`);
  const results = await sql`
    SELECT slug, name, array_length(images, 1) as image_count 
    FROM products 
    WHERE array_length(images, 1) > 0
    ORDER BY brand, name
  `;
  
  console.log(`\nProducts with images:`);
  for (const row of results) {
    console.log(`   • ${row.slug}: ${row.image_count} images`);
  }
}

main().catch(console.error);
