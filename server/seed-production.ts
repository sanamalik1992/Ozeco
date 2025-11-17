import { db } from '@db';
import { products, reviews, customerPhotos } from '@shared/schema';
import { sql, inArray } from 'drizzle-orm';

/**
 * Auto-seeds production database with bestseller products if empty
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

    console.log('📦 Production database empty - seeding products...');

    // Define the specific slugs we're inserting
    const newProductSlugs = ['dyu-a1f-pro', 'eleglide-m2', 'engwe-engine-x', 'eleglide-m1-plus'];

    // Insert 4 bestseller products
    await db.insert(products).values([
      {
        id: sql`gen_random_uuid()`,
        name: 'DYU A1F Pro Electric Bike',
        brand: 'DYU',
        slug: 'dyu-a1f-pro',
        description: 'Smart, space-saving electric bike designed for everyday urban commuting. With 250W motor, pedal assist, and foldable aluminium frame.',
        price: '399.99',
        originalPrice: '449.99',
        image: 'https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533',
        images: ['https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533', 'https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533'],
        category: 'Folding',
        inStock: true,
        stockQuantity: 3,
        isBestseller: true,
        motorPower: '250W',
        batteryCapacity: '36V 7.5Ah',
        maxRange: '45 km',
        topSpeed: '25 km/h',
        weight: '22 kg',
        maxLoad: '75 kg',
        riderHeight: '5\'0" - 5\'8" (150-173 cm)',
        features: ['250W Brushless Motor', '36V Lithium Battery', 'Foldable Frame', 'Front and Rear Lights', 'Rear Cargo Rack'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Eleglide M2 Electric Bike',
        brand: 'Eleglide',
        slug: 'eleglide-m2',
        description: 'High-spec electric mountain bike built for both adventure and everyday riding. Featuring powerful 250W motor, long-lasting 15Ah battery.',
        price: '549.99',
        originalPrice: '644.99',
        image: 'https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533',
        images: ['https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533', 'https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533'],
        category: 'Mountain',
        inStock: true,
        stockQuantity: 8,
        isBestseller: true,
        motorPower: '250W',
        batteryCapacity: '36V 15Ah',
        maxRange: '125 km',
        topSpeed: '25 km/h',
        weight: '22 kg',
        maxLoad: '120 kg',
        riderHeight: '5\'3" - 6\'5" (160-195 cm)',
        features: ['High-Torque 250W Motor', 'Removable 15Ah Battery', 'Shimano 21-Speed', 'Hydraulic Front Suspension', 'Hydraulic Disc Brakes'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'ENGWE Engine X Electric Bike',
        brand: 'ENGWE',
        slug: 'engwe-engine-x',
        description: 'Versatile, foldable electric bike designed for both urban travel and off-road adventure. With powerful 250W motor, all-terrain fat tyres, and front and rear suspension.',
        price: '899.99',
        originalPrice: '919.99',
        image: 'https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533',
        images: ['https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533', 'https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533'],
        category: 'Folding',
        inStock: true,
        stockQuantity: 5,
        isBestseller: true,
        motorPower: '250W',
        batteryCapacity: '48V 13Ah',
        maxRange: '90-100 km',
        topSpeed: '25 km/h',
        weight: '30.1 kg',
        maxLoad: '150 kg',
        riderHeight: '5\'4" - 6\'2" (163-188 cm)',
        features: ['250W Brushless Motor', 'Removable 48V Battery', 'Fat 20x4.0 Tyres', '7-Speed Shimano', 'LCD Dashboard', 'Folding Frame'],
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Eleglide M1 Plus Electric Bike',
        brand: 'Eleglide',
        slug: 'eleglide-m1-plus',
        description: 'Lightweight commuter Electric bike perfect for daily urban travel with excellent range and performance.',
        price: '499.99',
        originalPrice: '519.99',
        image: 'https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533',
        images: ['https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533', 'https://www.ozeco.co.uk/cdn/shop/files/cj7t1hsn_35fb7784-cdd1-47f4-ac82-37029f1f5c86.png?v=1747598271&width=533'],
        category: 'Mountain',
        inStock: true,
        stockQuantity: 6,
        isBestseller: true,
        motorPower: '250W',
        batteryCapacity: '36V 12.5Ah',
        maxRange: '100 km',
        topSpeed: '25 km/h',
        riderHeight: '5\'3" - 6\'5" (160-195 cm)',
        features: ['250W Motor', 'Shimano 7-Speed', 'Hydraulic Disc Brakes', 'LED Display', 'Removable Battery'],
      },
    ]);

    // Get the exact products we just inserted using their unique slugs
    const insertedProducts = await db.select().from(products).where(
      inArray(products.slug, newProductSlugs)
    );
    
    // Verify all products were inserted correctly
    if (insertedProducts.length !== newProductSlugs.length) {
      console.error(`⚠️ Expected ${newProductSlugs.length} products but found ${insertedProducts.length}`);
      return;
    }
    
    console.log(`✅ Found ${insertedProducts.length} products to seed with reviews and photos`);
    console.log('📝 Seeding reviews and customer photos...');
    
    // Add sample reviews for each bestseller product
    for (const product of insertedProducts) {
      // Add 5 reviews per product
      await db.insert(reviews).values([
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'Sarah Williams',
          rating: 5,
          title: 'Excellent Electric bike!',
          comment: 'Absolutely love this Electric bike. Great battery life and very comfortable to ride. Highly recommend!',
          verified: true,
        },
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'James Thompson',
          rating: 5,
          title: 'Best purchase this year',
          comment: 'This Electric bike has transformed my daily commute. No more sweating on the way to work!',
          verified: true,
        },
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'Emily Davies',
          rating: 4,
          title: 'Great value for money',
          comment: 'Really impressed with the quality and performance. The only minor issue is the weight, but overall fantastic.',
          verified: true,
        },
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'Michael Brown',
          rating: 5,
          title: 'Perfect for city commuting',
          comment: 'Exactly what I needed for my daily commute. Battery lasts all week on my 10-mile round trips.',
          verified: true,
        },
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'Sophie Taylor',
          rating: 5,
          title: 'Highly recommended',
          comment: 'Fast delivery, easy assembly, and brilliant customer service. The Electric bike itself is top quality!',
          verified: true,
        },
      ]);

      // Add 2 customer photos per product
      await db.insert(customerPhotos).values([
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'Sarah W.',
          imageUrl: product.image,
          caption: `Love my new ${product.brand} Electric bike!`,
          approved: true,
        },
        {
          id: sql`gen_random_uuid()`,
          productId: product.id,
          customerName: 'James T.',
          imageUrl: product.image,
          caption: 'Best commute upgrade ever!',
          approved: true,
        },
      ]);
    }

    console.log('✅ Production database seeded successfully!');
    console.log(`📊 Added ${insertedProducts.length} products, ${insertedProducts.length * 5} reviews, and ${insertedProducts.length * 2} customer photos`);
    console.log('🎉 www.ozeco.co.uk is now ready!');
  } catch (error) {
    console.error('⚠️  Failed to seed production database:', error);
    // Don't throw - allow app to continue starting
  }
}
