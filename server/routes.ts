import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema, insertFavoriteSchema, insertCustomerPhotoSchema, orders, orderItems, products, newsletterSubscribers, insertNewsletterSubscriberSchema, reviews, customerPhotos, blogPosts } from "@shared/schema";
import { db } from "@db";
import { sql, eq, and, gte } from "drizzle-orm";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, isPayPalConfigured } from "./paypal";
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from "./email";
import { getUncachableResendClient } from "./resend";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.id);
      res.json(variants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/brand/:brand", async (req, res) => {
    try {
      const products = await storage.getProductsByBrand(req.params.brand);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      
      // SECURITY: Validate product price is a valid positive decimal
      const price = parseFloat(validated.price);
      if (isNaN(price) || price <= 0 || price > 999999.99) {
        return res.status(400).json({ error: "Invalid product price. Must be a positive number up to 999,999.99" });
      }
      if (validated.originalPrice) {
        const originalPrice = parseFloat(validated.originalPrice);
        if (isNaN(originalPrice) || originalPrice <= 0 || originalPrice > 999999.99) {
          return res.status(400).json({ error: "Invalid original price. Must be a positive number up to 999,999.99" });
        }
      }
      
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      const sessionId = req.session.id || req.sessionID;
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      const sessionId = req.session.id || req.sessionID;
      const validated = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      
      // SECURITY: Enforce quantity limits on incoming quantity
      const quantity = validated.quantity ?? 1;
      if (quantity < 1 || quantity > 99) {
        return res.status(400).json({ error: "Quantity must be between 1 and 99" });
      }
      
      // SECURITY: Check if adding this quantity to existing cart item would exceed limit
      const existingCartItems = await storage.getCartItems(sessionId);
      const existingItem = existingCartItems.find(item => item.productId === validated.productId);
      if (existingItem) {
        const newTotal = existingItem.quantity + quantity;
        if (newTotal > 99) {
          return res.status(400).json({ 
            error: `Cannot add ${quantity} items. Maximum quantity per product is 99. You already have ${existingItem.quantity} in your cart.` 
          });
        }
      }
      
      const item = await storage.addToCart(validated);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      const sessionId = req.session.id || req.sessionID;
      const { quantity } = req.body;
      
      // SECURITY: Validate quantity bounds
      if (typeof quantity !== "number" || quantity < 1 || quantity > 99) {
        return res.status(400).json({ error: "Quantity must be between 1 and 99" });
      }
      
      // SECURITY: Validate cart item belongs to current session
      const item = await storage.updateCartItemQuantity(req.params.id, quantity, sessionId);
      if (!item) {
        return res.status(404).json({ error: "Cart item not found or access denied" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      const sessionId = req.session.id || req.sessionID;
      
      // SECURITY: Validate cart item belongs to current session
      const success = await storage.removeFromCart(req.params.id, sessionId);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found or access denied" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }
      const sessionId = req.session.id || req.sessionID;
      await storage.clearCart(sessionId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get payment configuration (for runtime configuration)
  app.get("/api/config/stripe-key", async (req, res) => {
    // Use runtime environment variable (not build-time VITE_ prefix)
    const stripePublicKey = process.env.STRIPE_PUBLISHABLE_KEY;
    res.json({ 
      publishableKey: stripePublicKey || null 
    });
  });

  app.get("/api/config/payment-methods", async (req, res) => {
    res.json({
      stripe: Boolean(process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY),
      paypal: isPayPalConfigured
    });
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      if (!stripeSecretKey) {
        return res.status(400).json({ 
          error: "Stripe is not configured. Please contact support." 
        });
      }

      if (!req.session) {
        return res.status(500).json({ error: "Session not initialized" });
      }

      // Use valid Stripe API version (YYYY-MM-DD format)
      const stripe = new Stripe(stripeSecretKey);

      const sessionId = req.session.id || req.sessionID;

      // SECURITY: Recalculate total from server-side cart (never trust client amount!)
      const cartItems = await storage.getCartItems(sessionId);

      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total using integer pence to avoid floating-point errors
      const totalInPence = cartItems.reduce((sum, item) => {
        const priceInPence = Math.round(parseFloat(item.product.price) * 100);
        return sum + (priceInPence * item.quantity);
      }, 0);

      // Create a PaymentIntent with the server-calculated amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalInPence, // Amount already in pence
        currency: "gbp",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          sessionId,
          itemCount: cartItems.length.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

      if (password === adminPassword) {
        // Set admin flag in session
        if (req.session) {
          (req.session as any).isAdmin = true;
        }
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      if (req.session) {
        (req.session as any).isAdmin = false;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/check", async (req, res) => {
    try {
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      res.json({ authenticated: isAdmin });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/reset-production-data", async (req, res) => {
    try {
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      console.log('🔐 Reset request - Session exists:', !!req.session, 'isAdmin:', isAdmin);
      if (!isAdmin) {
        return res.status(403).json({ 
          error: "Unauthorized - Please login to admin dashboard first",
          hint: "Go to /admin and login with your admin password, then try again"
        });
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        return res.status(400).json({ error: "This endpoint is for production use only. Development database uses local seed script." });
      }

      console.log('🔄 Admin-triggered production data reset...');
      
      await db.delete(reviews).execute();
      await db.delete(customerPhotos).execute();
      await db.delete(blogPosts).execute();
      
      console.log('✅ Production data deleted');
      console.log(`   - Deleted all reviews`);
      console.log(`   - Deleted all customer photos`);
      console.log(`   - Deleted all blog posts`);
      console.log('🔄 Triggering re-seed...\n');

      const { seedProductionIfEmpty } = await import('./seed-production');
      await seedProductionIfEmpty();

      res.json({ 
        success: true, 
        message: "Production data has been reset and re-seeded successfully.",
        note: "All reviews, customer photos, and blog posts now have correct dates."
      });
    } catch (error: any) {
      console.error('❌ Failed to reset production data:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/fix-product-images", async (req, res) => {
    try {
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ 
          error: "Unauthorized - Please login to admin dashboard first",
        });
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        return res.status(400).json({ error: "This endpoint is for production use only." });
      }

      console.log('🖼️  Admin-triggered product image fix...');
      
      const fs = await import('fs');
      const path = await import('path');
      const dataDir = path.join(process.cwd(), 'server', 'data');
      const productsRaw = await fs.promises.readFile(path.join(dataDir, 'products.json'), 'utf-8');
      const productsData = JSON.parse(productsRaw);
      
      let updatedCount = 0;
      for (const productData of productsData) {
        const { slug, image, images } = productData;
        const result = await db.update(products)
          .set({ 
            image,
            images: images || [image]
          })
          .where(eq(products.slug, slug))
          .returning();
        
        if (result.length > 0) {
          updatedCount++;
          console.log(`   ✅ Updated images for: ${result[0].name}`);
        }
      }

      res.json({ 
        success: true, 
        message: `Successfully updated images for ${updatedCount} products.`,
        updatedCount
      });
    } catch (error: any) {
      console.error('❌ Failed to fix product images:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin product management routes
  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Validate that we have some updates
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
      }

      const product = await storage.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/variants/:id", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Validate that we have some updates
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
      }

      const variant = await storage.updateProductVariant(id, updates);
      
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }

      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products/:productId/variants", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { productId } = req.params;
      const variantData = { ...req.body, productId };

      // Check for duplicate variant (same name and value for this product)
      const existingVariants = await storage.getProductVariants(productId);
      const duplicate = existingVariants.find(
        v => v.name === variantData.name && v.value === variantData.value
      );

      if (duplicate) {
        return res.status(400).json({ 
          error: `A variant with ${variantData.name}: ${variantData.value} already exists for this product` 
        });
      }

      const variant = await storage.createProductVariant(variantData);
      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/variants/:id", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const success = await storage.deleteProductVariant(id);
      
      if (!success) {
        return res.status(404).json({ error: "Variant not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Checkout and order routes
  app.post("/api/checkout/shipping", async (req, res) => {
    try {
      // Store shipping data in session
      if (req.session) {
        (req.session as any).shippingData = req.body;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders/complete", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const shippingData = (req.session as any).shippingData;

      if (!shippingData) {
        return res.status(400).json({ error: "Shipping information not found" });
      }

      // Get cart items with total calculation (server-side for security)
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      const totalInPence = cartItems.reduce((sum, item) => {
        const priceInPence = Math.round(parseFloat(item.product.price) * 100);
        return sum + (priceInPence * item.quantity);
      }, 0);
      const totalAmount = (totalInPence / 100).toFixed(2);

      // Complete order in a transaction with atomic stock decrements
      const createdOrder = await db.transaction(async (tx) => {
        // STEP 1: Validate and decrement stock for each cart item
        for (const item of cartItems) {
          // Lock the row and check stock (prevents concurrent overselling)
          const result = await tx.execute(sql`
            SELECT stock_quantity, in_stock 
            FROM products 
            WHERE id = ${item.product.id}
            FOR UPDATE
          `);

          const product = result.rows[0] as { stock_quantity: number | null; in_stock: boolean } | undefined;
          if (!product || !product.in_stock || (product.stock_quantity ?? 0) < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}. Please update your cart.`);
          }

          // Decrement stock (row is locked, safe from concurrent updates)
          const newQuantity = (product.stock_quantity ?? 0) - item.quantity;
          const updateResult = await tx
            .update(products)
            .set({
              stockQuantity: newQuantity,
              inStock: newQuantity > 0 ? product.in_stock : false
            })
            .where(eq(products.id, item.product.id))
            .returning({ id: products.id });

          // Verify the update succeeded
          if (updateResult.length === 0) {
            throw new Error(`Failed to update stock for ${item.product.name}. Product may have been deleted.`);
          }
        }

        // STEP 2: Create order
        const [order] = await tx.insert(orders).values({
          sessionId,
          stripePaymentIntentId: req.body.stripePaymentIntentId || null,
          paypalOrderId: req.body.paypalOrderId || null,
          totalAmount,
          status: "completed",
          fulfillmentStatus: "pending",
          paymentMethod: req.body.paymentMethod || "stripe",
          customerEmail: shippingData.customerEmail,
          customerName: shippingData.customerName,
          shippingAddressLine1: shippingData.shippingAddressLine1,
          shippingAddressLine2: shippingData.shippingAddressLine2 || null,
          shippingCity: shippingData.shippingCity,
          shippingPostalCode: shippingData.shippingPostalCode,
          shippingCountry: shippingData.shippingCountry || "GB",
          customerPhone: shippingData.customerPhone || null,
        }).returning();

        // STEP 3: Create order items
        for (const item of cartItems) {
          await tx.insert(orderItems).values({
            orderId: order.id,
            productId: item.product.id,
            quantity: item.quantity,
            priceAtTime: item.product.price,
          });
        }

        return order;
      });

      // Clear the cart (only after successful transaction)
      await storage.clearCart(sessionId);

      // Clear shipping data from session
      delete (req.session as any).shippingData;

      // Send order confirmation email
      try {
        const orderItems = await storage.getOrderItems(createdOrder.id);
        await sendOrderConfirmationEmail({
          ...createdOrder,
          items: orderItems,
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Order completion error:", error);
      
      // Check if it's a stock error
      if (error.message.includes("Insufficient stock")) {
        return res.status(409).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  // Admin orders routes
  app.get("/api/admin/orders", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/orders/:id", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const items = await storage.getOrderItems(req.params.id);
      res.json({ ...order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/fulfillment", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { fulfillmentStatus } = req.body;
      const order = await storage.updateOrderFulfillment(req.params.id, fulfillmentStatus);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/tracking", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      let { trackingNumber } = req.body;
      
      // Validate tracking number if provided
      if (trackingNumber) {
        trackingNumber = trackingNumber.trim();
        if (trackingNumber.length === 0) {
          trackingNumber = null;
        } else if (trackingNumber.length > 64) {
          return res.status(400).json({ error: "Tracking number must be 64 characters or less" });
        } else if (!/^[a-zA-Z0-9\-_]+$/.test(trackingNumber)) {
          return res.status(400).json({ error: "Tracking number must contain only letters, numbers, hyphens, and underscores" });
        }
      } else {
        trackingNumber = null;
      }
      
      const order = await storage.updateOrderTracking(req.params.id, trackingNumber || null);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Send shipping confirmation email if tracking number is provided
      if (trackingNumber) {
        try {
          const orderItems = await storage.getOrderItems(order.id);
          await sendShippingConfirmationEmail({
            ...order,
            items: orderItems,
          }, trackingNumber);
        } catch (emailError) {
          console.error('Failed to send shipping confirmation email:', emailError);
        }
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PayPal payment routes (from PayPal integration blueprint)
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Newsletter routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Check for existing subscriber
      const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, validatedData.email)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "This email is already subscribed to our newsletter." });
      }
      
      // Generate unique £10 off discount code with timestamp to prevent collisions
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      const discountCode = `OZECO10-${timestamp}-${random}`;
      
      const [subscriber] = await db.insert(newsletterSubscribers).values({
        ...validatedData,
        discountCode,
      }).returning();

      res.json({ 
        success: true, 
        discountCode,
        message: "Successfully subscribed to newsletter!"
      });
    } catch (error: any) {
      // Fallback for any database errors
      res.status(500).json({ error: "Failed to subscribe. Please try again later." });
    }
  });

  app.get("/api/admin/newsletter/subscribers", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Add pagination support (limit to 100 most recent subscribers by default)
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const offset = parseInt(req.query.offset as string) || 0;

      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .orderBy(sql`created_at DESC`)
        .limit(limit)
        .offset(offset);
        
      res.json(subscribers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
      }

      // Get Resend client
      const { client: resend, fromEmail } = await getUncachableResendClient();

      // Send email to support@ozeco.co.uk
      await resend.emails.send({
        from: fromEmail,
        to: 'support@ozeco.co.uk',
        subject: `Contact Form Submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">New Contact Form Message</h2>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This message was sent from the Ozeco.co.uk contact form.</p>
          </div>
        `,
      });

      res.json({ 
        success: true,
        message: "Message sent successfully!"
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // Seed route (development only)
  app.post("/api/seed", async (req, res) => {
    try {
      const productData = [
        {
          name: "ENGWE Engine X",
          brand: "ENGWE",
          slug: "engwe-engine-x",
          description: "The ultimate urban electric bike combining power and style. Perfect for city commuting with long-range capability and advanced features. UK road legal with 250W motor.",
          price: "899.99",
          originalPrice: "999.99",
          image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533",
          images: ["https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=533"],
          category: "City",
          inStock: true,
          isBestseller: false,
          motorPower: "250W",
          batteryCapacity: "48V 15Ah",
          maxRange: "75 miles",
          topSpeed: "28 mph",
          weight: "25kg",
          maxLoad: "120kg",
          frameType: "Step-through",
          features: ["LCD Display", "Integrated Lights", "Front Suspension", "Disc Brakes", "USB Charging Port"],
        },
        {
          name: "Eleglide M2",
          brand: "Eleglide",
          slug: "eleglide-m2",
          description: "Sleek urban electric bike combining style with cutting-edge technology. Our bestseller loved by thousands of UK riders. Perfect for daily commuting and weekend adventures.",
          price: "594.99",
          originalPrice: "614.99",
          image: "https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533",
          images: ["https://www.ozeco.co.uk/cdn/shop/files/kvo5ypxk.png?v=1747598026&width=533"],
          category: "City",
          inStock: true,
          isBestseller: true,
          motorPower: "250W",
          batteryCapacity: "36V 12.5Ah",
          maxRange: "65 miles",
          topSpeed: "15.5 mph",
          weight: "23kg",
          maxLoad: "100kg",
          frameType: "Mountain",
          features: ["Shimano 7-Speed", "LED Display", "Front Suspension", "Disc Brakes", "Removable Battery"],
        },
        {
          name: "DYU A1F Pro",
          brand: "DYU",
          slug: "dyu-a1f-pro",
          description: "Compact folding electric bike perfect for commuters and city living. Ultra-portable design that fits in your car boot. Great value for money.",
          price: "379.99",
          originalPrice: "399.99",
          image: "https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533",
          images: ["https://www.ozeco.co.uk/cdn/shop/files/hyw8o05i.png?v=1747601600&width=533"],
          category: "Folding",
          inStock: true,
          isBestseller: false,
          motorPower: "250W",
          batteryCapacity: "36V 10Ah",
          maxRange: "45 miles",
          topSpeed: "15.5 mph",
          weight: "18kg",
          maxLoad: "120kg",
          frameType: "Folding",
          features: ["Ultra Compact", "LED Display", "Front & Rear Lights", "Disc Brakes", "Quick Fold Mechanism"],
        },
        {
          name: "Duotts C29",
          brand: "Duotts",
          slug: "duotts-c29",
          description: "Premium electric bike with exceptional performance and design. Long-range capability with comfortable riding position. Perfect for longer commutes and weekend rides.",
          price: "684.99",
          originalPrice: null,
          image: "https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533",
          images: ["https://www.ozeco.co.uk/cdn/shop/files/01vs85u4.png?v=1747683500&width=533"],
          category: "Mountain",
          inStock: true,
          isBestseller: false,
          motorPower: "250W",
          batteryCapacity: "48V 14Ah",
          maxRange: "80 miles",
          topSpeed: "15.5 mph",
          weight: "26kg",
          maxLoad: "120kg",
          frameType: "Mountain",
          features: ["29-inch Wheels", "Shimano 7-Speed", "Front Suspension", "Hydraulic Disc Brakes", "LCD Display"],
        },
      ];

      for (const product of productData) {
        await storage.createProduct(product);
      }

      res.json({ message: "Database seeded successfully", count: productData.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Referral routes
  app.post("/api/referral/create", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email required" });
      }
      
      // Check if user already has a referral code
      const existing = await storage.getReferralsByEmail(email);
      if (existing.length > 0) {
        return res.json(existing[0]);
      }
      
      // Generate unique referral code
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `OZECO${timestamp}${random}`;
      
      const referral = await storage.createReferralCode({
        code,
        referrerEmail: email,
        uses: 0,
        discountAmount: 20,
      });
      
      res.status(201).json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/referral/check/:code", async (req, res) => {
    try {
      const referral = await storage.getReferralCode(req.params.code);
      if (!referral) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      res.json({ valid: true, discountAmount: referral.discountAmount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/referral/stats/:email", async (req, res) => {
    try {
      const referrals = await storage.getReferralsByEmail(req.params.email);
      if (referrals.length === 0) {
        return res.status(404).json({ error: "No referral codes found" });
      }
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Increment views
      await storage.incrementBlogViews(post.id);
      
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Favorites routes
  app.get("/api/favorites", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const favoritesWithProducts = await storage.getFavorites(sessionId);
      // Return properly typed response
      res.json(favoritesWithProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const validated = insertFavoriteSchema.omit({ sessionId: true }).parse(req.body);
      
      const favorite = await storage.addFavorite({ 
        productId: validated.productId, 
        sessionId 
      });
      res.json(favorite);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/favorites/:productId", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { productId } = req.params;
      
      const removed = await storage.removeFavorite(productId, sessionId);
      if (!removed) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/favorites/check/:productId", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { productId } = req.params;
      
      const isFavorite = await storage.isFavorite(productId, sessionId);
      res.json({ isFavorite });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Photos routes
  app.get("/api/customer-photos", async (req, res) => {
    try {
      const photos = await storage.getAllCustomerPhotos();
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customer-photos/product/:productId", async (req, res) => {
    try {
      const photos = await storage.getCustomerPhotosByProduct(req.params.productId);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simple in-memory rate limiting for customer photo submissions
  const photoSubmissionLimits = new Map<string, { count: number; resetTime: number }>();
  const PHOTO_SUBMISSION_LIMIT = 3; // Max 3 submissions per hour per session
  const PHOTO_SUBMISSION_WINDOW = 60 * 60 * 1000; // 1 hour

  app.post("/api/customer-photos", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      
      // Check rate limit
      const now = Date.now();
      const limit = photoSubmissionLimits.get(sessionId);
      
      if (limit) {
        if (now < limit.resetTime) {
          if (limit.count >= PHOTO_SUBMISSION_LIMIT) {
            return res.status(429).json({ 
              error: "Rate limit exceeded. Please try again later.",
              retryAfter: Math.ceil((limit.resetTime - now) / 1000 / 60) // minutes
            });
          }
          limit.count++;
        } else {
          photoSubmissionLimits.set(sessionId, { count: 1, resetTime: now + PHOTO_SUBMISSION_WINDOW });
        }
      } else {
        photoSubmissionLimits.set(sessionId, { count: 1, resetTime: now + PHOTO_SUBMISSION_WINDOW });
      }
      
      // Validate request body using Zod schema
      const validated = insertCustomerPhotoSchema.omit({ approved: true }).parse(req.body);
      
      // Create photo with approved=false by default (requires admin approval)
      const photo = await storage.createCustomerPhoto({
        ...validated,
        approved: false,
      });
      
      // Return success but note that photo needs approval
      res.json({ 
        success: true, 
        message: "Photo submitted successfully. It will appear in the gallery after approval.",
        photoId: photo.id 
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
