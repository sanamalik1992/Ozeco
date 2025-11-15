import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface ProductImage {
  slug: string;
  images: string[];
}

const products = [
  { slug: 'eleglide-m1-plus', names: ['Eleglide M1 Plus', 'M1 Plus'] },
  { slug: 'eleglide-m2', names: ['Eleglide M2', 'M2'] },
  { slug: 'engwe-engine-x', names: ['ENGWE Engine X', 'Engine X'] },
  { slug: 'engwe-ep-2-boost', names: ['ENGWE EP-2', 'EP-2 Boost'] },
  { slug: 'engwe-engine-pro-2-0', names: ['ENGWE Engine Pro 2.0', 'Engine Pro'] },
  { slug: 'engwe-l20', names: ['ENGWE L20', 'L20 3.0'] },
  { slug: 'engwe-t14', names: ['ENGWE T14', 'T14'] },
  { slug: 'dyu-a1f-pro', names: ['DYU A1F Pro', 'A1F Pro'] },
  { slug: 'dyu-d3f', names: ['DYU D3F', 'D3F'] },
  { slug: 'duotts-c29', names: ['Duotts C29', 'C29'] },
  { slug: 'duotts-s26', names: ['Duotts S26', 'S26'] },
  { slug: 'touroll-b1', names: ['Touroll B1', 'B1'] },
  { slug: 'touroll-j1', names: ['Touroll J1', 'J1'] },
  { slug: 'touroll-j1-st', names: ['Touroll J1 ST', 'J1 ST'] },
  { slug: 'touroll-u1', names: ['Touroll U1', 'U1'] },
  { slug: 'fiido-d3-pro', names: ['Fiido D3 Pro', 'D3 Pro'] },
];

async function findProductLinks(html: string, productNames: string[]): Promise<string | null> {
  const $ = cheerio.load(html);
  
  // Look for links containing product names
  const links: string[] = [];
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().toLowerCase();
    
    if (href) {
      for (const name of productNames) {
        if (text.includes(name.toLowerCase()) || href.includes(name.toLowerCase().replace(/\s+/g, '-'))) {
          links.push(href);
        }
      }
    }
  });
  
  return links.length > 0 ? links[0] : null;
}

async function scrapeProductPage(url: string): Promise<string[]> {
  try {
    console.log(`  Fetching: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });
    
    const $ = cheerio.load(response.data);
    const images: string[] = [];
    
    // Try multiple selectors for product images
    const selectors = [
      '.product-gallery img',
      '.product-image img',
      '.gallery img',
      '[class*="product"] img[src*="cdn"]',
      '[class*="Product"] img[src*="cdn"]',
      'img[alt*="product"]',
      'img[alt*="bike"]',
      '.main-image img',
      '[data-role="product-image"] img',
    ];
    
    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const src = $(element).attr('src') || $(element).attr('data-src');
        
        if (src && 
            !src.includes('data:image') && 
            !src.includes('placeholder') &&
            !src.includes('logo') &&
            !src.includes('icon') &&
            (src.includes('cdn') || src.includes('product') || src.includes('image'))) {
          
          const fullUrl = src.startsWith('http') ? src : `https:${src}`;
          
          // Remove query parameters and get high-res version
          const cleanUrl = fullUrl.split('?')[0];
          const highResUrl = cleanUrl.replace(/_small|_thumb|_medium/g, '_large').replace(/&width=\d+/g, '&width=1200');
          
          if (!images.includes(highResUrl)) {
            images.push(highResUrl);
          }
        }
      });
      
      if (images.length > 0) {
        console.log(`  Found ${images.length} images using selector: ${selector}`);
        break;
      }
    }
    
    return images.slice(0, 8); // Limit to 8 images per product
  } catch (error) {
    console.error(`  Error scraping ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    writeFileSync(filepath, Buffer.from(response.data));
    console.log(`    ✓ Downloaded: ${filepath.split('/').pop()}`);
    return true;
  } catch (error) {
    console.error(`    ✗ Failed to download: ${url}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Starting product image scraper for Ozeco.co.uk\n');
  
  const results: ProductImage[] = [];
  const baseUrl = 'https://ozeco.co.uk';
  
  // Common URL patterns to try
  const urlPatterns = [
    '/products/',
    '/product/',
    '/shop/',
    '/collections/all/products/',
  ];
  
  for (const product of products) {
    console.log(`\n📦 Processing: ${product.slug}`);
    
    let productUrl: string | null = null;
    let imageUrls: string[] = [];
    
    // Try direct URL patterns first
    for (const pattern of urlPatterns) {
      const testUrl = `${baseUrl}${pattern}${product.slug}`;
      
      try {
        const response = await axios.head(testUrl, { timeout: 5000 });
        if (response.status === 200) {
          productUrl = testUrl;
          console.log(`  ✓ Found at: ${productUrl}`);
          break;
        }
      } catch {}
    }
    
    // If direct URL didn't work, search homepage
    if (!productUrl) {
      try {
        console.log(`  Searching homepage for product link...`);
        const homeResponse = await axios.get(baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 10000,
        });
        
        const relativeLink = await findProductLinks(homeResponse.data, product.names);
        if (relativeLink) {
          productUrl = relativeLink.startsWith('http') ? relativeLink : `${baseUrl}${relativeLink}`;
          console.log(`  ✓ Found link: ${productUrl}`);
        }
      } catch (error) {
        console.log(`  ✗ Could not find product page`);
      }
    }
    
    if (!productUrl) {
      console.log(`  ⚠️  Skipping ${product.slug} - no product page found`);
      continue;
    }
    
    // Scrape images from product page
    imageUrls = await scrapeProductPage(productUrl);
    
    if (imageUrls.length === 0) {
      console.log(`  ⚠️  No images found on product page`);
      continue;
    }
    
    // Create directory for product
    const productDir = join(process.cwd(), 'client', 'public', 'products', product.slug);
    if (!existsSync(productDir)) {
      mkdirSync(productDir, { recursive: true });
    }
    
    // Download images
    console.log(`  📥 Downloading ${imageUrls.length} images...`);
    const localPaths: string[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const filename = `${i + 1}.${ext}`;
      const filepath = join(productDir, filename);
      
      const success = await downloadImage(url, filepath);
      if (success) {
        localPaths.push(`/products/${product.slug}/${filename}`);
      }
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (localPaths.length > 0) {
      results.push({
        slug: product.slug,
        images: localPaths,
      });
      console.log(`  ✅ Successfully downloaded ${localPaths.length} images`);
    }
    
    // Rate limiting between products
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save results
  const outputPath = join(process.cwd(), 'scripts', 'scraped-images.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n\n✅ Scraping complete!`);
  console.log(`📊 Results: ${results.length}/${products.length} products scraped successfully`);
  console.log(`💾 Data saved to: scripts/scraped-images.json\n`);
}

main().catch(console.error);
