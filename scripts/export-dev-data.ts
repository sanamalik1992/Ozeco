import { db } from '../db/index';
import { products, reviews, customerPhotos } from '../shared/schema';
import fs from 'fs';
import path from 'path';

async function exportDevData() {
  console.log('📊 Exporting development database...\n');

  const allProducts = await db.select().from(products);
  const allReviews = await db.select().from(reviews);
  const allPhotos = await db.select().from(customerPhotos);

  console.log(`Found ${allProducts.length} products`);
  console.log(`Found ${allReviews.length} reviews`);
  console.log(`Found ${allPhotos.length} customer photos\n`);

  const seedDataDir = path.join(process.cwd(), 'scripts', 'seed-data');
  if (!fs.existsSync(seedDataDir)) {
    fs.mkdirSync(seedDataDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(seedDataDir, 'products.json'),
    JSON.stringify(allProducts, null, 2)
  );

  fs.writeFileSync(
    path.join(seedDataDir, 'reviews.json'),
    JSON.stringify(allReviews, null, 2)
  );

  fs.writeFileSync(
    path.join(seedDataDir, 'customer-photos.json'),
    JSON.stringify(allPhotos, null, 2)
  );

  console.log('✅ Data exported successfully!');
  console.log(`📁 Files written to: ${seedDataDir}`);
  process.exit(0);
}

exportDevData();
