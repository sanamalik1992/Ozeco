import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isBestseller: boolean("is_bestseller").notNull().default(false),
  motorPower: text("motor_power"),
  batteryCapacity: text("battery_capacity"),
  maxRange: text("max_range"),
  topSpeed: text("top_speed"),
  weight: text("weight"),
  maxLoad: text("max_load"),
  frameType: text("frame_type"),
  riderHeight: text("rider_height"),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  inTheBox: text("in_the_box").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type ProductWithPricing = Product & {
  inStock: boolean;
  lowestVariantPrice: string | null;
  displayPrice: string;
};

export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  value: text("value").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull().default(1),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }),
  discountCode: text("discount_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("pending"),
  fulfillmentStatus: text("fulfillment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("stripe"),
  trackingNumber: text("tracking_number"),
  courierLink: text("courier_link"),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  shippingAddressLine1: text("shipping_address_line1").notNull(),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city").notNull(),
  shippingPostalCode: text("shipping_postal_code").notNull(),
  shippingCountry: text("shipping_country").notNull().default("GB"),
  customerPhone: text("customer_phone"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id")
    .notNull()
    .references(() => orders.id),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  discountCode: text("discount_code"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  publishedDate: timestamp("published_date").notNull(),
  category: text("category").notNull(),
  featuredImage: text("featured_image").notNull(),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const referralCodes = pgTable("referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  referrerEmail: text("referrer_email").notNull(),
  uses: integer("uses").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(20),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const customerPhotos = pgTable("customer_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  customerName: text("customer_name").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type CustomerPhoto = typeof customerPhotos.$inferSelect;
export type InsertCustomerPhoto = typeof customerPhotos.$inferInsert;

export const visitorSessions = pgTable("visitor_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  firstSeen: timestamp("first_seen").notNull().default(sql`now()`),
  lastSeen: timestamp("last_seen").notNull().default(sql`now()`),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  trafficSource: text("traffic_source"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
});

export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = typeof visitorSessions.$inferInsert;

export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  path: text("path").notNull(),
  productId: varchar("product_id").references(() => products.id),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(),
  productId: varchar("product_id").references(() => products.id),
  orderId: varchar("order_id").references(() => orders.id),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
