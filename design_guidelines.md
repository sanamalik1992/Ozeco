# Design Guidelines for Ozeco.co.uk

## Design Approach
**Reference-Based E-Commerce Design** drawing inspiration from successful online retail platforms including Specialized Bicycles, Canyon Bikes, and premium e-commerce experiences like Shopify stores and Nike. Focus on building trust, showcasing products beautifully, and optimizing for conversions.

## Core Design Principles
1. **Visual Product Showcase**: High-quality imagery drives e-bike purchases
2. **Trust & Credibility**: UK-based business, established 2022, professional presentation
3. **Conversion-Focused**: Every page element guides toward purchase decision
4. **Mobile-First**: UK customers browse heavily on mobile devices

## Typography System
- **Headings**: Modern sans-serif, bold weights (700-800) for impact
  - H1: Large, commanding (text-5xl to text-7xl on desktop)
  - H2: Section headers (text-4xl to text-5xl)
  - H3: Product names, subsections (text-2xl to text-3xl)
- **Body**: Clean, readable sans-serif (400-500 weight)
  - Primary text: text-base to text-lg
  - Specifications/details: text-sm
- **Accents**: Medium weight (600) for CTAs, labels, price emphasis

## Layout System
**Spacing Units**: Tailwind spacing of 4, 6, 8, 12, 16, 20, 24 for consistency
- Component padding: p-6 to p-8 on mobile, p-12 to p-16 on desktop
- Section spacing: py-16 to py-24 on mobile, py-24 to py-32 on desktop
- Grid gaps: gap-6 to gap-8

## Component Library

### Homepage Structure
1. **Hero Section** (100vh on desktop, 80vh mobile)
   - Full-width lifestyle image of person riding e-bike in UK scenery
   - Centered headline: "Premium Electric Bikes for UK Riders"
   - Subheading highlighting brands and UK delivery
   - Primary CTA button with blurred background overlay
   - Trust badges below (UK Based, Free Delivery, 2+ Years Experience)

2. **Featured Brands Section**
   - 4-column grid (2 on tablet, 1 on mobile)
   - Brand cards with logo, brief description, "Shop Brand" CTA
   - Brands: Engwe, Eleglide, DYU, DUOTTS

3. **Featured Products Carousel**
   - 3-4 products visible on desktop, scrollable
   - Product card: Large image, name, price prominently, key specs, "View Details" button
   - "View All Bikes" CTA

4. **Why Choose Ozeco Section**
   - 3-column grid (stacks on mobile)
   - Icon + benefit cards: UK Based Business, Expert Support, Competitive Pricing, Fast UK Delivery

5. **Social Proof/Reviews Section**
   - 3-column testimonial cards with customer names
   - Star ratings, purchase badges

6. **Newsletter + Company Story**
   - 2-column split: Newsletter signup form left, brief company story right
   - "Stay updated on new arrivals and exclusive deals"

### Product Listing Page
- Filter sidebar (collapsible on mobile): Price range, Brand, Battery range, Max speed
- Product grid: 3 columns desktop, 2 tablet, 1 mobile (gap-6)
- Sorting dropdown: Price, Popularity, Newest
- Each product card: Large image, brand badge, name, price (large), key specs below, "View Details" + "Quick View" buttons

### Product Detail Page
- 2-column layout (stacks on mobile)
- Left: Image gallery (main large image + 4-5 thumbnails below)
- Right: Brand, Product name (large), Price (very prominent), Star rating + review count
- Specification table (organized, scannable)
- "Add to Cart" primary button (large, prominent)
- Accordion sections: Full Specifications, Delivery Info, Warranty, Returns
- Below: "You May Also Like" product carousel

### Navigation
- Sticky header with logo left, main nav center (Shop by Brand, All E-Bikes, Contact, About), cart/search icons right
- Mobile: Hamburger menu, slide-in navigation
- Breadcrumbs on product/category pages

### Footer
- 4-column layout (stacks on mobile)
- Column 1: About Ozeco, brief story
- Column 2: Quick Links (Categories, Brands, Delivery, Returns)
- Column 3: Contact info, UK address
- Column 4: Newsletter signup
- Bottom bar: Payment icons (Stripe), copyright, terms/privacy links

### Shopping Cart & Checkout
- Cart: Product list with images, quantity adjusters, remove option, prominent total, "Proceed to Checkout" CTA
- Checkout: Single-page flow, left side form (shipping/billing), right side order summary sticky
- Stripe payment integration section
- Progress indicator at top (Cart → Details → Payment → Complete)

### Trust Elements Throughout
- "UK Based Business Since 2022" badge
- "Secure Checkout" with padlock icon
- Delivery estimate on product pages
- Clear return policy links

## Image Strategy

### Required Images
1. **Homepage Hero**: Lifestyle shot of rider on e-bike in UK countryside/urban setting (full-width, high-quality)
2. **Brand Logos**: Engwe, Eleglide, DYU, DUOTTS (transparent backgrounds)
3. **Product Images**: Multiple angles for each bike (white background for consistency)
4. **Category/Feature Images**: Lifestyle shots showing bikes in use
5. **Trust Badges**: Payment security, UK delivery icons

### Image Guidelines
- Product images: Consistent white/light grey backgrounds, multiple angles
- Lifestyle images: Natural UK settings, diverse riders, aspirational
- All images optimized for web, lazy-loading implemented
- Alt text for SEO and accessibility

## Conversion Optimization Elements
- Prominent pricing throughout
- Clear, action-oriented CTAs ("Shop Now", "View Details", "Add to Cart")
- Scarcity indicators where genuine ("Only 3 left", "Popular choice")
- Free delivery threshold messaging
- Comparison tool for multiple bikes
- Live chat widget (bottom right, non-intrusive)
- Exit-intent popup with discount code capture

## Mobile Responsiveness
- Touch-friendly button sizes (minimum 44px height)
- Simplified navigation for small screens
- Sticky "Add to Cart" bar on product pages
- Image zoom functionality on tap
- Collapsible filters/specifications

## Performance Considerations
- Lazy-load images below fold
- Optimize hero image for fast LCP
- Minimize animation (subtle hover states only)
- Fast cart updates without page reload

This design framework prioritizes visual appeal, trust-building, and conversion optimization specifically for UK e-bike shoppers, drawing from proven e-commerce patterns while maintaining distinctiveness for the Ozeco brand.