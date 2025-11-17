import fs from 'fs';
import path from 'path';

// Load full dataset from fresh export
const productsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'seed-data', 'products.json'), 'utf-8')
);
const reviewsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'seed-data', 'reviews.json'), 'utf-8')
);
const photosData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'seed-data', 'customer-photos.json'), 'utf-8')
);

console.log('Original data:');
console.log(`  Products: ${productsData.length}`);
console.log(`  Reviews: ${reviewsData.length}`);
console.log(`  Photos: ${photosData.length}\n`);

// Keep ALL products (16)
const optimizedProducts = productsData;

// Keep random 100-150 reviews per product
const reviewsByProduct: Record<string, any[]> = {};

reviewsData.forEach((review: any) => {
  if (!reviewsByProduct[review.productId]) {
    reviewsByProduct[review.productId] = [];
  }
  reviewsByProduct[review.productId].push(review);
});

const optimizedReviews: any[] = [];
Object.entries(reviewsByProduct).forEach(([productId, reviews]) => {
  // Random number between 100 and 150
  const randomCount = Math.floor(Math.random() * 51) + 100; // 100-150
  const toKeep = reviews.slice(0, Math.min(randomCount, reviews.length));
  optimizedReviews.push(...toKeep);
  console.log(`Product ${productId.substring(0, 8)}: keeping ${toKeep.length}/${reviews.length} reviews`);
});

// Keep ALL customer photos (33)
const optimizedPhotos = photosData;

console.log('\nOptimized data:');
console.log(`  Products: ${optimizedProducts.length}`);
console.log(`  Reviews: ${optimizedReviews.length}`);
console.log(`  Photos: ${optimizedPhotos.length}`);

// Write optimized data
fs.writeFileSync(
  path.join(process.cwd(), 'server', 'data', 'products.json'),
  JSON.stringify(optimizedProducts, null, 2)
);
fs.writeFileSync(
  path.join(process.cwd(), 'server', 'data', 'reviews.json'),
  JSON.stringify(optimizedReviews, null, 2)
);
fs.writeFileSync(
  path.join(process.cwd(), 'server', 'data', 'customer-photos.json'),
  JSON.stringify(optimizedPhotos, null, 2)
);

const avgReviews = Math.round(optimizedReviews.length / optimizedProducts.length);
console.log(`\n📊 Average: ${avgReviews} reviews per product`);
console.log('\n✅ Optimized seed data written to server/data/');
