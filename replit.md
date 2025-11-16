# Ozeco.co.uk - Electric Bike E-Commerce Website

## Overview
Ozeco.co.uk is a UK-based e-commerce platform specializing in premium Electric bikes from brands like ENGWE, Eleglide, DYU, Duotts, Touroll, and Fiido. The primary goal is to establish a professional, high-converting online presence with a vibrant design to attract the target demographic, addressing previous shortcomings in online sales despite offline success.

**Google Ads Compliance:** The website is fully compliant with Google Ads policies to prevent misrepresentation suspension. All business information and contact details are clearly displayed throughout the site. Business is not VAT registered (below UK threshold).

## User Preferences
- Always use "Electric bikes" with capital E for branding.
- Use UK English spelling throughout the site (e.g., "authorised" not "authorized", "organised" not "organized").
- Business phone number: 03333398590 (displayed on all pages and footer).
- WhatsApp contact: +44 7446 610660 (for chat functionality only).
- Primary email: support@ozeco.co.uk (consistent across entire site).
- The primary color should be a vibrant green (HSL 142 85% 42%).
- Use orange/red badges for urgency and sales.
- Include an autoplaying HTML5 video on the hero banner.
- All product data and images should be real from ozeco.co.uk.
- Implement a brand carousel featuring logos.
- Focus on a professional, high-converting design.
- Stock urgency threshold: Products with less than 10 units in stock display urgency messaging.

## System Architecture
The platform is built with a modern web stack designed for performance and scalability.

### UI/UX Decisions
- **Color Scheme**: Vibrant green (HSL 142 85% 42%) as primary, accented with orange/red for urgency.
- **Branding**: Consistent use of "Electric bikes" (capital E).
- **Brand Theming**: Each e-bike brand features its own distinct color gradient (e.g., ENGWE: Orange, Eleglide: Blue, Duotts: Purple, Touroll: Green, DYU: Red, Fiido: Cyan) in components like the BrandCarousel.
- **Star Ratings**: Yellow stars for filled, gray for unfilled, available in multiple sizes.
- **Verified Badges**: Green checkmark badges to denote verified purchases.
- **Typography**: `font-display` for headings and clean sans-serif for body text.
- **Imagery**: High-quality product photos sourced directly from ozeco.co.uk.
- **Conversion Elements**: Prominent trust badges (free delivery, warranty), clear Calls-to-Action (CTAs), and urgency messaging.

### Technical Implementations
- **Frontend**: React with TypeScript for robust development, Wouter for client-side routing, and TanStack Query for data fetching and caching.
- **Backend**: Express.js with TypeScript provides a RESTful API.
- **Database**: PostgreSQL hosted on Neon, accessed via Drizzle ORM and HTTP driver for reliability.
- **Styling**: Tailwind CSS for utility-first styling, complemented by shadcn/ui components.
- **Session Management**: `express-session` middleware with a memory store for user sessions and cart persistence.
- **Build Tool**: Vite for a fast development experience and optimized builds.

### Feature Specifications
- **Product Catalog**: Displays 16 real products across various brands with comprehensive specifications, images, star ratings, and review counts. Products are navigable via slugs. All product cards include heart/favorite icons for quick wishlist access.
- **Product Variants System**: Complete variant management for Electric bikes including wheel sizes (27.5", 29"), colors (with color swatch UI), and battery options (single/double). Each variant has independent pricing, stock quantities, and optional variant-specific images with object-contain display and error handling. API endpoint `/api/products/:id/variants` provides variant data. Currently configured for 9 products: ENGWE T14 (4 colors), ENGWE Engine Pro (3 colors), ENGWE Engine X (3 colors), ENGWE EP-2 Boost (3 colors), ENGWE L20 (2 colors), Eleglide M1 Plus (2 wheel sizes), Duotts C29 (2 battery options), Touroll U1 (2 wheel sizes), and Fiido D3 Pro (2 colors).
- **Homepage**: Features an autoplaying HTML5 video hero banner, featured bestseller products, a brand carousel, and trust signals.
- **Shop Page**: Offers a full product catalog with filtering by brand and category, and sorting options. Supports URL parameters for filtering.
- **Navigation**: Comprehensive menu system with "Shop by Brand" (6 brands: ENGWE, Eleglide, DYU, Duotts, Touroll, Fiido) and "Shop by Type" (4 categories: City, Folding, Mountain, Off-Road) dropdowns on desktop and mobile.
- **Breadcrumb Navigation**: Product detail pages include breadcrumb trails (Shop > Brand > Product Name) for easy navigation back to shop or brand pages.
- **Product Detail Pages**: Provides in-depth product information, high-quality images with error handling, breadcrumb navigation, average star ratings, customer photos (prominently displayed above reviews in Amazon-style gallery), customer reviews, and add-to-cart functionality with variant selection UI (color swatches for colors with object-contain display, buttons for other variant types).
- **Customer Reviews System**: Includes 2,202 verified reviews per product with pagination, filtering (Most Recent, Highest/Lowest Rated), and expand/collapse functionality. Reviews display customer name, rating, title, comment, verified badge, and date.
- **Shopping Cart System**: Session-based with full CRUD operations via API. Includes server-side total calculation, input validation, and security features to prevent fraud.
- **Checkout & Order Management**: Multi-step checkout process, Stripe (including Shop Pay) and PayPal integrations, atomic stock decrement during order completion, and an admin dashboard for inventory and order management with fulfillment tracking and tracking number support.
- **Inventory Management**: Dual-field system (`stockQuantity` and `inStock`) with atomic stock decrements, low stock warnings, and overselling prevention.
- **Newsletter System**: Popup appears 1 second after first visit, offers £10 discount code, generates unique timestamp-based codes (format: OZECO10-{timestamp}-{random}), with duplicate email protection and admin dashboard integration.
- **Policy Pages**: Complete legal pages including Returns Policy (14-day returns), Shipping Policy (1-day dispatch, 2-3 day delivery), Privacy Policy (GDPR-compliant), Terms of Service, and comprehensive FAQ (15+ questions with accordion UI).
- **WhatsApp Chat**: Floating button in bottom-right corner with hover-to-expand text, pulse animation, and pre-filled message directing to business WhatsApp (+44 7446 610660). Note: The displayed business phone number is 03333398590 on all pages, while WhatsApp uses +44 7446 610660.
- **Social Media Integration**: Instagram and Facebook links in footer with hover effects.
- **Payment Display**: Footer showcases accepted payment methods (Stripe, PayPal, Credit/Debit Cards) with icons.
- **Search Functionality**: Live autocomplete search with dropdown showing product images, names, brands, and prices. Searches across product names, brands, descriptions, and categories.
- **Email Order Confirmations**: Automatic email notifications sent via Resend when orders are placed (order confirmation) and when orders are fulfilled with tracking numbers (shipping confirmation). Professional HTML templates with order details and branding.
- **Product Comparison Tool**: Side-by-side comparison of up to 3 Electric bikes with detailed specs (motor power, battery, range, speed, weight, frame type). Stored in localStorage for persistence across sessions.
- **Wishlist/Favorites**: Session-based favorites system with heart icon buttons throughout the site. Dedicated wishlist page shows saved products with quick add-to-cart functionality.
- **Customer Photo Gallery**: User-generated content gallery showcasing customer photos with their Electric bikes. Photos are moderated (approved flag) and linked to specific products. Encourages social proof and engagement.
- **Blog System**: Full-featured blog with posts, categories, featured images with error handling and fallback placeholders, and view tracking. Blog images are stored in `public/blog/` directory and served from `/blog/` path.

### System Design Choices
- **API Routes**: Standard RESTful API for products, cart management, and reviews.
- **Database Schema**:
    - `products`: Stores detailed e-bike information including unique identifiers, pricing, descriptions, images, technical specs, and inventory status (`inStock`, `stockQuantity`).
    - `product_variants`: Stores product variations with columns: id, product_id (FK to products), name (variant type: Color/Wheel Size/Battery), value (specific option: Black/29 Inch/Double Battery), price (variant-specific price), stock_quantity, in_stock (boolean), image (optional variant-specific image URL), created_at.
    - `cart_items`: Links session IDs to product IDs and quantities.
    - `reviews`: Stores customer feedback including product ID, customer name, rating, title, comment, and verification status.
    - `orders` & `order_items`: For tracking completed purchases with shipping addresses and tracking numbers.
    - `newsletter_subscribers`: Stores subscriber emails, discount codes, and subscription timestamps.
    - `favorites`: Session-based wishlist/favorites system linking session IDs to product IDs.
    - `customer_photos`: User-generated content gallery with product ID references, customer names, image URLs, captions, and approval status.

## External Dependencies
- **Database**: PostgreSQL (via Neon)
- **Payment Gateways**: Stripe (for credit/debit cards and Shop Pay), PayPal
- **Build Tool**: Vite
- **Styling Framework**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Data Fetching**: TanStack Query