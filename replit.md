# Ozeco.co.uk - Electric Bike E-Commerce Website

## Project Overview
High-converting e-commerce website for Ozeco.co.uk (Ozeco Ltd, founded 2022 as ekwonline), a UK-based Electric bike business selling premium brands including ENGWE, Eleglide, DYU, Duotts, Touroll, and Fiido.

**Goal**: Professional, trustworthy website optimized for conversions with vibrant design that attracts the e-bike crowd. Previous Google Ads attempts failed and current website sales are low despite eBay success.

## Key Requirements
- Always use "Electric bikes" with capital E for branding
- Vibrant green (HSL 142 85% 42%) primary color
- Orange/red badges for urgency and sales
- Autoplaying HTML5 video on hero banner
- All real products from ozeco.co.uk
- Brand carousel with logos
- Professional, high-converting design

## Current Implementation Status

### ✅ Completed Features

#### Database & Backend
- PostgreSQL database via Neon (HTTP driver for reliability)
- Comprehensive product schema with e-bike specifications
- Session-based cart system with express-session middleware
- RESTful API routes:
  - `GET /api/products` - All products with filtering
  - `GET /api/cart` - Session-based cart
  - `POST /api/cart` - Add to cart
  - `PATCH /api/cart/:id` - Update quantity
  - `DELETE /api/cart/:id` - Remove item
  - `DELETE /api/cart` - Clear cart

#### Product Catalog
- **16 real products** from ozeco.co.uk:
  - ENGWE (5 models): Engine X, Engine Pro 2.0, EP-2 Boost, L20 3.0 Boost, T14
  - Eleglide (2 models): M2, M1 Plus
  - DYU (2 models): A1F Pro, D3F
  - Duotts (2 models): C29, S26
  - Touroll (4 models): B1, J1, J1 ST, U1
  - Fiido (1 model): D3 Pro

#### Frontend Pages
- **Homepage** (`/`)
  - Autoplaying HTML5 video hero banner
  - Featured products section (bestsellers from database)
  - Brand carousel with 6 brands
  - Trust signals (free delivery, 12-month warranty, secure checkout, UK support)
  - Responsive design

- **Shop Page** (`/shop`)
  - Full product catalog with real images from ozeco.co.uk
  - Brand filtering (all brands)
  - Category filtering
  - Sorting (Featured, Price Low/High, Name A-Z)
  - Responsive grid layout (1/3/4 columns)
  - URL parameter support for brand filtering (`/shop?brand=ENGWE`)
  - Error handling for API failures
  - Bestseller and Sale badges
  - Product count display

- **Contact Page** (`/contact`)
  - Contact form
  - Business information

#### Components
- **BrandCarousel**: Interactive brand showcase with links to filtered shop views
- **FeaturedProducts**: Dynamic bestseller display from database with error handling
- **ProductCard**: Reusable product display component
- **Hero**: Video banner with conversion-optimized copy
- **Header/Footer**: Navigation and branding
- **TrustSignals**: Conversion elements (free delivery, warranty, etc.)

### 🚧 In Progress / TODO
- Product detail pages (`/product/:slug`)
- Shopping cart UI
- Checkout flow
- Payment integration (Stripe ready via integration)
- Product search functionality
- Customer reviews system
- Blog/content pages
- Admin dashboard for product management

## Technical Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Session**: express-session with memory store
- **Build**: Vite

## Database Schema

### Products Table
```typescript
{
  id: varchar (UUID),
  name: text,
  slug: text (unique),
  brand: text,
  category: text,
  price: numeric,
  originalPrice: numeric (nullable),
  description: text,
  image: text,
  images: text[],
  features: text[],
  maxRange: text,
  topSpeed: text,
  motorPower: text,
  batteryCapacity: text,
  weight: text,
  maxLoad: text,
  frameType: text,
  inStock: boolean,
  isBestseller: boolean,
  stockStatus: text,
  createdAt: timestamp
}
```

### Cart Items Table
```typescript
{
  id: serial,
  sessionId: text,
  productId: varchar,
  quantity: integer,
  createdAt: timestamp
}
```

## Design Guidelines
- **Primary Color**: Vibrant green HSL(142, 85%, 42%) - used for CTAs and highlights
- **Badges**: Orange/red for urgency (sales, limited stock)
- **Typography**: Font display for headings, clean sans-serif for body
- **Spacing**: Consistent medium spacing throughout
- **Images**: High-quality product photos from ozeco.co.uk
- **Conversion Elements**: Trust badges, clear CTAs, urgency messaging

## Development Commands
```bash
npm run dev          # Start development server (port 5000)
npm run db:push      # Push schema changes to database
npm run db:push --force  # Force push (use with caution)
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `SESSION_SECRET` - Session encryption key
- `STRIPE_SECRET_KEY` - Stripe payment key (optional)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (optional)

## API Endpoints

### Products
- `GET /api/products` - List all products
  - Query params: None (filtering done client-side)
  - Returns: Array of Product objects

### Cart
- `GET /api/cart` - Get cart items for current session
- `POST /api/cart` - Add item to cart
  - Body: `{ productId, quantity }`
- `PATCH /api/cart/:id` - Update cart item quantity
  - Body: `{ quantity }`
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear entire cart

## Recent Changes
- **2025-11-13**: 
  - Migrated from WebSocket-based database driver to HTTP driver for better reliability
  - Replaced test data with 16 real products from ozeco.co.uk
  - Created BrandCarousel component with URL-based filtering
  - Updated FeaturedProducts to pull from database
  - Added comprehensive error handling for API failures
  - Implemented session-based cart system
  - Added brand filtering via URL parameters

## Known Issues
- Brand carousel uses product images as logos (placeholder - should be replaced with actual brand logos)
- No product detail pages yet (clicking products shows placeholder)
- Cart UI not implemented (backend ready)
- No search functionality
- Mobile menu not fully implemented

## Next Steps
1. Implement product detail pages with full specifications
2. Build shopping cart UI
3. Add checkout and payment flow
4. Implement product search
5. Add customer reviews
6. Create admin dashboard
7. Optimize for SEO
8. Add analytics tracking
