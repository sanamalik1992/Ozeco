import { 
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Review,
  type InsertReview,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type BlogPost,
  type InsertBlogPost,
  type ReferralCode,
  type InsertReferralCode,
  type Favorite,
  type InsertFavorite,
  type CustomerPhoto,
  type InsertCustomerPhoto,
  type ProductVariant,
  type InsertProductVariant,
  users,
  products,
  cartItems,
  reviews,
  orders,
  orderItems,
  blogPosts,
  referralCodes,
  favorites,
  customerPhotos,
  productVariants,
} from "@shared/schema";
import { db } from "@db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByBrand(brand: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number, sessionId: string): Promise<CartItem | undefined>;
  removeFromCart(id: string, sessionId: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
  
  // Review methods
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;
  updateOrderFulfillment(id: string, fulfillmentStatus: string): Promise<Order | undefined>;
  updateOrderTracking(id: string, trackingNumber: string | null): Promise<Order | undefined>;
  
  // Blog methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  incrementBlogViews(id: string): Promise<BlogPost | undefined>;
  
  // Referral methods
  createReferralCode(referral: InsertReferralCode): Promise<ReferralCode>;
  getReferralCode(code: string): Promise<ReferralCode | undefined>;
  getReferralsByEmail(email: string): Promise<ReferralCode[]>;
  incrementReferralUses(code: string): Promise<ReferralCode | undefined>;
  
  // Favorite methods
  getFavorites(sessionId: string): Promise<(Favorite & { product: Product })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(productId: string, sessionId: string): Promise<boolean>;
  isFavorite(productId: string, sessionId: string): Promise<boolean>;
  
  // Customer Photo methods
  getAllCustomerPhotos(): Promise<(CustomerPhoto & { product: Product })[]>;
  getCustomerPhotosByProduct(productId: string): Promise<CustomerPhoto[]>;
  createCustomerPhoto(photo: InsertCustomerPhoto): Promise<CustomerPhoto>;
  approveCustomerPhoto(id: string): Promise<CustomerPhoto | undefined>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug));
    return result[0];
  }

  async getProductsByBrand(brand: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.brand, brand));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
    
    return result.map((row: any) => ({
      ...row.cart_items,
      product: row.products!,
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.productId, item.productId),
          eq(cartItems.sessionId, item.sessionId)
        )
      );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + (item.quantity || 1);
      const updated = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItemQuantity(id: string, quantity: number, sessionId: string): Promise<CartItem | undefined> {
    // SECURITY: Only update if cart item belongs to this session
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)))
      .returning();
    return result[0];
  }

  async removeFromCart(id: string, sessionId: string): Promise<boolean> {
    // SECURITY: Only delete if cart item belongs to this session
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)))
      .returning();
    return result.length > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Review methods
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(insertReview).returning();
    return result[0];
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return result.map((row: any) => ({
      ...row.order_items,
      product: row.products!,
    }));
  }

  async updateOrderFulfillment(id: string, fulfillmentStatus: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ fulfillmentStatus })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrderTracking(id: string, trackingNumber: string | null): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ trackingNumber })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  // Blog methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedDate));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result[0];
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(insertBlogPost).returning();
    return result[0];
  }

  async incrementBlogViews(id: string): Promise<BlogPost | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    const result = await db.update(blogPosts)
      .set({ views: post.views + 1 })
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  // Referral methods
  async createReferralCode(insertReferralCode: InsertReferralCode): Promise<ReferralCode> {
    const result = await db.insert(referralCodes).values(insertReferralCode).returning();
    return result[0];
  }

  async getReferralCode(code: string): Promise<ReferralCode | undefined> {
    const result = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    return result[0];
  }

  async getReferralsByEmail(email: string): Promise<ReferralCode[]> {
    return await db.select().from(referralCodes).where(eq(referralCodes.referrerEmail, email));
  }

  async incrementReferralUses(code: string): Promise<ReferralCode | undefined> {
    const referral = await this.getReferralCode(code);
    if (!referral) return undefined;
    
    const result = await db.update(referralCodes)
      .set({ uses: referral.uses + 1 })
      .where(eq(referralCodes.code, code))
      .returning();
    return result[0];
  }

  // Favorite methods
  async getFavorites(sessionId: string): Promise<(Favorite & { product: Product })[]> {
    const result = await db
      .select()
      .from(favorites)
      .leftJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.sessionId, sessionId))
      .orderBy(desc(favorites.createdAt));
    
    return result.map((row: any) => ({
      ...row.favorites,
      product: row.products!,
    }));
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.productId, insertFavorite.productId),
          eq(favorites.sessionId, insertFavorite.sessionId)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(favorites).values(insertFavorite).returning();
    return result[0];
  }

  async removeFavorite(productId: string, sessionId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.productId, productId),
          eq(favorites.sessionId, sessionId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async isFavorite(productId: string, sessionId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.productId, productId),
          eq(favorites.sessionId, sessionId)
        )
      );
    return result.length > 0;
  }

  // Customer Photo methods
  async getAllCustomerPhotos(): Promise<(CustomerPhoto & { product: Product })[]> {
    const result = await db
      .select()
      .from(customerPhotos)
      .leftJoin(products, eq(customerPhotos.productId, products.id))
      .where(eq(customerPhotos.approved, true))
      .orderBy(desc(customerPhotos.createdAt));
    
    return result.map((row: any) => ({
      ...row.customerPhotos,
      product: row.products!,
    }));
  }

  async getCustomerPhotosByProduct(productId: string): Promise<CustomerPhoto[]> {
    return await db
      .select()
      .from(customerPhotos)
      .where(
        and(
          eq(customerPhotos.productId, productId),
          eq(customerPhotos.approved, true)
        )
      )
      .orderBy(desc(customerPhotos.createdAt));
  }

  async createCustomerPhoto(insertCustomerPhoto: InsertCustomerPhoto): Promise<CustomerPhoto> {
    const result = await db.insert(customerPhotos).values(insertCustomerPhoto).returning();
    return result[0];
  }

  async approveCustomerPhoto(id: string): Promise<CustomerPhoto | undefined> {
    const result = await db.update(customerPhotos)
      .set({ approved: true })
      .where(eq(customerPhotos.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
