import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { Page } from 'playwright';

interface ProductImage {
  slug: string;
  images: string[];
}

const products = [
  { slug: 'dyu-a1f-pro', name: 'DYU A1F Pro Electric Bike' },
  { slug: 'dyu-d3f', name: 'DYU D3F Electric Bike' },
  { slug: 'duotts-c29', name: 'Duotts C29 Electric Bike' },
  { slug: 'duotts-s26', name: 'Duotts S26 Electric Bike' },
  { slug: 'engwe-ep-2-boost', name: 'ENGWE EP-2 Boost Electric Bike' },
  { slug: 'engwe-engine-pro-2-0', name: 'ENGWE Engine Pro 2.0 Electric Bike' },
  { slug: 'engwe-engine-x', name: 'ENGWE Engine X Electric Bike' },
  { slug: 'engwe-l20', name: 'ENGWE L20 3.0 Boost' },
  { slug: 'engwe-t14', name: 'ENGWE T14 Electric Bike' },
  { slug: 'eleglide-m1-plus', name: 'Eleglide M1 Plus Electric Bike' },
  { slug: 'eleglide-m2', name: 'Eleglide M2 Electric Bike' },
  { slug: 'fiido-d3-pro', name: 'Fiido D3 Pro' },
  { slug: 'touroll-b1', name: 'Touroll B1 Electric Bike' },
  { slug: 'touroll-j1', name: 'Touroll J1 Electric Bike' },
  { slug: 'touroll-j1-st', name: 'Touroll J1 ST Electric Bike' },
  { slug: 'touroll-u1', name: 'Touroll U1 Electric Bike' },
];

async function searchProductPage(page: Page, productName: string): Promise<string | null> {
  try {
    console.log(`  Searching for: ${productName}`);
    
    // Go to homepage
    await page.goto('https://ozeco.co.uk', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Try to find search input
    const searchButton = page.locator('button[aria-label="Search"], button:has-text("Search"), [data-testid="search-button"]').first();
    await searchButton.click({ timeout: 5000 });
    
    // Type in search box
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill(productName, { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Press enter or click search
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Click first product result
    const productLink = page.locator('a[href*="/products/"], .product-link, .product-card a').first();
    const href = await productLink.getAttribute('href');
    
    if (href) {
      const fullUrl = href.startsWith('http') ? href : `https://ozeco.co.uk${href}`;
      console.log(`  Found product page: ${fullUrl}`);
      return fullUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`  Error searching for ${productName}:`, error);
    return null;
  }
}

async function scrapeProductImages(page: Page, productUrl: string): Promise<string[]> {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Common selectors for product image galleries
    const imageSelectors = [
      '.product-gallery img',
      '.product-images img',
      '.product-image img',
      '[data-testid*="product-image"]',
      '.gallery-image img',
      '.main-image img',
      '[class*="ProductImage"] img',
      '[class*="product-image"] img',
    ];
    
    const images: string[] = [];
    
    for (const selector of imageSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`  Found ${elements.length} images using selector: ${selector}`);
        
        for (const img of elements) {
          const src = await img.getAttribute('src');
          const dataSrc = await img.getAttribute('data-src');
          const imageUrl = src || dataSrc;
          
          if (imageUrl && !imageUrl.includes('data:image') && !images.includes(imageUrl)) {
            // Convert relative URLs to absolute
            const fullUrl = imageUrl.startsWith('http') 
              ? imageUrl 
              : `https://ozeco.co.uk${imageUrl}`;
            images.push(fullUrl);
          }
        }
        
        if (images.length > 0) break;
      }
    }
    
    console.log(`  Extracted ${images.length} unique image URLs`);
    return images;
  } catch (error) {
    console.error(`  Error scraping images:`, error);
    return [];
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`    Failed to download ${url}: ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    writeFileSync(filepath, Buffer.from(buffer));
    console.log(`    Downloaded: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`    Error downloading ${url}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting product image scraper for Ozeco.co.uk\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const results: ProductImage[] = [];
  
  for (const product of products) {
    console.log(`\nProcessing: ${product.name}`);
    
    // Search for product page
    const productUrl = await searchProductPage(page, product.name);
    
    if (!productUrl) {
      console.log(`  ⚠️  Could not find product page, skipping`);
      continue;
    }
    
    // Scrape images
    const imageUrls = await scrapeProductImages(page, productUrl);
    
    if (imageUrls.length === 0) {
      console.log(`  ⚠️  No images found, skipping`);
      continue;
    }
    
    // Create directory for product
    const productDir = join(process.cwd(), 'client', 'public', 'products', product.slug);
    if (!existsSync(productDir)) {
      mkdirSync(productDir, { recursive: true });
    }
    
    // Download images
    const localPaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      const filename = `${i + 1}.${ext}`;
      const filepath = join(productDir, filename);
      
      const success = await downloadImage(url, filepath);
      if (success) {
        localPaths.push(`/products/${product.slug}/${filename}`);
      }
    }
    
    if (localPaths.length > 0) {
      results.push({
        slug: product.slug,
        images: localPaths,
      });
      console.log(`  ✅ Downloaded ${localPaths.length} images for ${product.name}`);
    }
    
    // Rate limiting
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  // Save results
  const outputPath = join(process.cwd(), 'scripts', 'scraped-images.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n\n✅ Scraping complete! Results saved to ${outputPath}`);
  console.log(`\nScraped ${results.length} products with images`);
}

main().catch(console.error);
