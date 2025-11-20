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
import { getClientIP, getLocationFromIP } from "./geolocation";

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
      
      // SECURITY: If variantId is provided, validate that it belongs to the product
      if (validated.variantId) {
        const variants = await storage.getProductVariants(validated.productId);
        const variantExists = variants.some(v => v.id === validated.variantId);
        if (!variantExists) {
          return res.status(400).json({ error: "Invalid variant for this product" });
        }
      }
      
      // SECURITY: Enforce quantity limits on incoming quantity
      const quantity = validated.quantity ?? 1;
      if (quantity < 1 || quantity > 99) {
        return res.status(400).json({ error: "Quantity must be between 1 and 99" });
      }
      
      // SECURITY: Check if adding this quantity to existing cart item would exceed limit
      const existingCartItems = await storage.getCartItems(sessionId);
      const existingItem = existingCartItems.find(item => 
        item.productId === validated.productId && 
        (item.variantId === validated.variantId || (!item.variantId && !validated.variantId))
      );
      if (existingItem) {
        const newTotal = existingItem.quantity + quantity;
        if (newTotal > 99) {
          return res.status(400).json({ 
            error: `Cannot add ${quantity} items. Maximum quantity per product is 99. You already have ${existingItem.quantity} in your cart.` 
          });
        }
      }
      
      const item = await storage.addToCart(validated);
      
      // Track cart addition analytics event (fire-and-forget, isolated from commerce flow)
      try {
        void storage.trackAnalyticsEvent({
          sessionId,
          eventType: 'add_to_cart',
          productId: validated.productId,
        }).catch((error) => {
          console.error('Failed to track cart addition analytics (async):', error);
        });
      } catch (error) {
        console.error('Failed to track cart addition analytics (sync):', error);
      }
      
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
    // FIX: Use the correct environment variable name
    const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;
    res.json({ 
      publishableKey: stripePublicKey || null 
    });
  });

  app.get("/api/config/payment-methods", async (req, res) => {
    res.json({
      stripe: Boolean(process.env.VITE_STRIPE_PUBLIC_KEY && process.env.STRIPE_SECRET_KEY),
      paypal: isPayPalConfigured
    });
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      console.log("Payment intent request - Stripe configured:", !!stripeSecretKey);
      
      if (!stripeSecretKey) {
        console.error("Stripe secret key not configured");
        return res.status(400).json({ 
          error: "Stripe is not configured. Please contact support." 
        });
      }

      if (!req.session) {
        console.error("Session not initialized");
        return res.status(500).json({ error: "Session not initialised" });
      }

      const sessionId = req.session.id || req.sessionID;
      const shippingData = (req.session as any).shippingData;
      
      if (!shippingData) {
        console.error("Shipping data missing from session");
        return res.status(400).json({ error: "Shipping information not found" });
      }

      // SECURITY: Recalculate total from server-side cart (never trust client amount!)
      const cartItems = await storage.getCartItems(sessionId);
      console.log("Cart items found:", cartItems.length);

      if (cartItems.length === 0) {
        console.error("Cart is empty for session:", sessionId);
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total using integer pence to avoid floating-point errors
      const totalInPence = cartItems.reduce((sum, item) => {
        // Use variant price if variant selected, otherwise use product price
        const price = item.variant?.price ?? item.product.price;
        const priceInPence = Math.round(parseFloat(price) * 100);
        return sum + (priceInPence * item.quantity);
      }, 0);
      const totalAmount = (totalInPence / 100).toFixed(2);
      
      console.log("Total amount (pence):", totalInPence);

      // STEP 1: Create pending order BEFORE payment to prevent data loss
      const [pendingOrder] = await db.insert(orders).values({
        sessionId,
        totalAmount,
        status: "pending",
        fulfillmentStatus: "pending",
        paymentMethod: "stripe",
        customerEmail: shippingData.customerEmail,
        customerName: shippingData.customerName,
        shippingAddressLine1: shippingData.shippingAddressLine1,
        shippingAddressLine2: shippingData.shippingAddressLine2 || null,
        shippingCity: shippingData.shippingCity,
        shippingPostalCode: shippingData.shippingPostalCode,
        shippingCountry: shippingData.shippingCountry || "GB",
        customerPhone: shippingData.customerPhone || null,
      }).returning();

      console.log("Pending order created:", pendingOrder.id);

      // STEP 2: Create order items linked to pending order
      for (const item of cartItems) {
        // Use variant price if variant selected, otherwise use product price
        const price = item.variant?.price || item.product.price;
        await db.insert(orderItems).values({
          orderId: pendingOrder.id,
          productId: item.product.id,
          quantity: item.quantity,
          priceAtTime: price,
        });
      }

      // STEP 3: Create PaymentIntent with orderId in metadata
      const stripe = new Stripe(stripeSecretKey);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalInPence,
        currency: "gbp",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: pendingOrder.id,
          sessionId,
          itemCount: cartItems.length.toString(),
          totalAmount: totalAmount, // Store for validation
        },
      });

      // STEP 4: Update order with payment intent ID
      await db.update(orders)
        .set({ stripePaymentIntentId: paymentIntent.id })
        .where(eq(orders.id, pendingOrder.id));

      console.log("Payment intent created:", paymentIntent.id);
      
      const result = { pendingOrder, paymentIntent };

      res.json({
        clientSecret: result.paymentIntent.client_secret,
        paymentIntentId: result.paymentIntent.id,
        orderId: result.pendingOrder.id,
      });
    } catch (error: any) {
      console.error("Stripe error details:", error);
      res.status(500).json({ error: error.message || "Payment initialisation failed" });
    }
  });

  // Stripe webhook handler (must use raw body for signature verification)
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured");
      return res.status(400).send("Webhook secret not configured");
    }

    let event: any;

    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(400).send("Stripe not configured");
      }

      const stripe = new Stripe(stripeSecretKey);
      event = stripe.webhooks.constructEvent(req.rawBody as Buffer, sig as string, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Stripe webhook event:", event.type);

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      console.log("Payment succeeded for order:", orderId);

      if (!orderId) {
        console.error("No orderId in payment intent metadata");
        return res.status(400).send("No orderId in metadata");
      }

      try {
        // Get the order
        const orderResults = await db.select().from(orders).where(eq(orders.id, orderId));
        const order = orderResults[0];

        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }

        // IDEMPOTENCY: Check if order is already completed
        if (order.status === "paid" || order.status === "completed") {
          console.log("Order already paid/completed, skipping (idempotent)");
          return res.json({ received: true });
        }

        // VALIDATION: Verify Stripe amount matches order total
        const expectedAmount = Math.round(parseFloat(order.totalAmount) * 100);
        if (paymentIntent.amount !== expectedAmount) {
          console.error(`Amount mismatch! Stripe: ${paymentIntent.amount}, Order: ${expectedAmount}`);
          throw new Error("Payment amount mismatch - manual review required");
        }

        // ATOMIC UPDATE: Only update if order is still pending (prevents race with verification endpoint)
        console.log("Attempting to finalize order via webhook:", orderId);
        const updateResult = await db.update(orders)
          .set({ 
            status: "paid",
            fulfillmentStatus: "pending",
          })
          .where(and(
            eq(orders.id, orderId),
            eq(orders.status, "pending")  // Only update if still pending
          ))
          .returning({ id: orders.id });

        // If update didn't affect any rows, order was already completed by verification endpoint
        if (updateResult.length === 0) {
          console.log("Order already completed by verification endpoint, skipping fulfillment (webhook)");
          return res.json({ received: true });
        }

        // Get order items for stock decrement
        const items = await db.select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        }).from(orderItems).where(eq(orderItems.orderId, orderId));

        // Decrement stock for each item
        for (const item of items) {
          const productResults = await db.select({
            stockQuantity: products.stockQuantity,
            inStock: products.inStock,
          }).from(products).where(eq(products.id, item.productId));

          const product = productResults[0];
          if (product && product.inStock) {
            const newQuantity = Math.max(0, (product.stockQuantity ?? 0) - item.quantity);
            await db
              .update(products)
              .set({
                stockQuantity: newQuantity,
                inStock: newQuantity > 0,
              })
              .where(eq(products.id, item.productId));
          }
        }

        console.log("Order finalized via webhook:", orderId);

        // Clear the cart (if session still exists)
        try {
          await storage.clearCart(order.sessionId);
        } catch (e) {
          console.log("Cart already cleared or session expired");
        }

        // Send confirmation email
        try {
          const orderItemsWithDetails = await storage.getOrderItems(orderId);
          await sendOrderConfirmationEmail({
            ...order,
            status: "paid",
            items: orderItemsWithDetails,
          });
          console.log("Confirmation email sent for order:", orderId);
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error("Error processing webhook:", error);
        res.status(500).send("Webhook processing failed");
      }
    } else {
      console.log("Unhandled event type:", event.type);
      res.json({ received: true });
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
        
        // Set a SIGNED persistent cookie to mark this browser as admin
        // This ensures analytics exclusion works across all pages and prevents spoofing
        res.cookie('ozeco_admin', 'authenticated', {
          signed: true, // Use signed cookie to prevent tampering
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days (shorter for security)
          sameSite: 'lax',
        });
        
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
      
      // Clear the admin cookie so analytics tracking resumes
      res.clearCookie('ozeco_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set admin exclusion cookie directly (simplified approach)
  app.post("/api/admin/set-exclusion", async (req, res) => {
    try {
      // Check if user is admin (already logged into dashboard)
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Set the signed admin exclusion cookie
      res.cookie('ozeco_admin', 'authenticated', {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      console.log("✅ Admin exclusion cookie set");
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

  app.post("/api/admin/sync-variants", async (req, res) => {
    try {
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ 
          error: "Unauthorized - Please login to admin dashboard first",
        });
      }

      console.log('🎨 Admin-triggered variant sync...');
      
      // Variant data from development database
      const variantData = [
        { slug: "engwe-t14", type: "Color", value: "Blue", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/fonogapi.png?v=1747666664&width=416" },
        { slug: "engwe-t14", type: "Color", value: "Grey", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/5yzpcgwa.png?v=1747600357&width=416" },
        { slug: "engwe-t14", type: "Color", value: "Orange", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/engwe-t14-folding-electric-bike-uk-pogo-cycles-19.jpg?v=1747666675&width=416" },
        { slug: "engwe-t14", type: "Color", value: "White", price: "474.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/v7ma4rnd.png?v=1747600357&width=416" },
        { slug: "engwe-engine-pro-2-0", type: "Color", value: "Black", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/4_273d206a-f78c-4295-8b1a-72e6846b3252.jpg?v=1751964957&width=416" },
        { slug: "engwe-engine-pro-2-0", type: "Color", value: "Blue", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/3_18b2d0a7-4e3f-485f-bcf8-1e330bb480ba.jpg?v=1751964957&width=416" },
        { slug: "engwe-engine-pro-2-0", type: "Color", value: "Green", price: "1129.99", stock: 8, image: "https://engwe-bikes-uk.com/cdn/shop/files/7.jpg?v=1751964921&width=416" },
        { slug: "engwe-engine-x", type: "Color", value: "Black", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/ejh2g8zn.png?v=1747666206&width=416" },
        { slug: "engwe-engine-x", type: "Color", value: "Red", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/or68pika.png?v=1747666416&width=416" },
        { slug: "engwe-engine-x", type: "Color", value: "White", price: "899.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/bjy0kolj.png?v=1747666224&width=416" },
        { slug: "engwe-ep-2-boost", type: "Color", value: "Black", price: "849.99", stock: 7, image: "https://engwe-bikes-uk.com/cdn/shop/files/3_b02d9783-702a-4623-bd84-2aea89d0019d.jpg?v=1753065836&width=416" },
        { slug: "engwe-ep-2-boost", type: "Color", value: "Grey", price: "849.99", stock: 7, image: "https://engwe-bikes-uk.com/cdn/shop/files/2_f7000d51-73b1-442e-9190-8c7e25f9bf48.jpg?v=1753325816&width=416" },
        { slug: "engwe-ep-2-boost", type: "Color", value: "Orange", price: "849.99", stock: 5, image: "https://engwe-bikes-uk.com/cdn/shop/files/1_fff95917-986e-48c3-bb0f-168ea6386d3a.jpg?v=1753065836&width=416" },
        { slug: "engwe-l20", type: "Color", value: "Black", price: "999.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/IMG-2140.webp?v=1756504566&width=400" },
        { slug: "engwe-l20", type: "Color", value: "Champagne", price: "999.99", stock: 5, image: "https://www.ozeco.co.uk/cdn/shop/files/IMG-2139.webp?v=1756504566&width=416" },
        { slug: "eleglide-m1-plus", type: "Wheel Size", value: "27.5 Inch", price: "499.99", stock: 5, image: null },
        { slug: "eleglide-m1-plus", type: "Wheel Size", value: "29 Inch", price: "539.99", stock: 6, image: null },
        { slug: "eleglide-m2", type: "Wheel Size", value: "27.5 Inch", price: "549.99", stock: 5, image: null },
        { slug: "eleglide-m2", type: "Wheel Size", value: "29 Inch", price: "599.99", stock: 3, image: null },
        { slug: "duotts-c29", type: "Battery", value: "Single Battery", price: "684.99", stock: 10, image: null },
        { slug: "duotts-c29", type: "Battery", value: "Double Battery", price: "839.99", stock: 10, image: null },
        { slug: "touroll-u1", type: "Wheel Size", value: "26 Inch", price: "509.99", stock: 5, image: null },
        { slug: "touroll-u1", type: "Wheel Size", value: "29 Inch", price: "529.99", stock: 5, image: null },
        { slug: "fiido-d3-pro", type: "Color", value: "Black", price: "359.99", stock: 5, image: null },
        { slug: "fiido-d3-pro", type: "Color", value: "White", price: "359.99", stock: 5, image: null },
      ];

      let createdCount = 0;
      let skippedCount = 0;

      for (const variantInfo of variantData) {
        // Find product by slug
        const product = await storage.getProductBySlug(variantInfo.slug);
        if (!product) {
          console.log(`   ⚠️  Product not found: ${variantInfo.slug}`);
          skippedCount++;
          continue;
        }

        // Check if variant already exists (check both name and value for exact match)
        const existingVariants = await storage.getProductVariants(product.id);
        const exists = existingVariants.some(v => 
          v.name.toLowerCase() === variantInfo.type.toLowerCase() && 
          v.value.toLowerCase() === variantInfo.value.toLowerCase()
        );

        if (exists) {
          console.log(`   ⏭️  Variant already exists: ${product.name} - ${variantInfo.type}: ${variantInfo.value}`);
          skippedCount++;
          continue;
        }

        // Validate price and stock before creating
        const price = parseFloat(variantInfo.price);
        const stock = parseInt(variantInfo.stock.toString());
        
        if (isNaN(price) || price < 0) {
          console.log(`   ⚠️  Invalid price for ${product.name} - ${variantInfo.type}: ${variantInfo.value}`);
          skippedCount++;
          continue;
        }
        
        if (isNaN(stock) || stock < 0) {
          console.log(`   ⚠️  Invalid stock for ${product.name} - ${variantInfo.type}: ${variantInfo.value}`);
          skippedCount++;
          continue;
        }

        // Create variant
        await storage.createProductVariant({
          productId: product.id,
          name: variantInfo.type,
          value: variantInfo.value,
          price: variantInfo.price,
          stockQuantity: stock,
          image: variantInfo.image || null,
        });

        createdCount++;
        console.log(`   ✅ Created variant: ${product.name} - ${variantInfo.type}: ${variantInfo.value} (£${variantInfo.price}, stock: ${stock})`);
      }

      res.json({ 
        success: true, 
        message: `Successfully synced variants: ${createdCount} created, ${skippedCount} skipped (already exist).`,
        created: createdCount,
        skipped: skippedCount
      });
    } catch (error: any) {
      console.error('❌ Failed to sync variants:', error);
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

      // If stockQuantity is being updated, automatically set inStock status
      if (updates.stockQuantity !== undefined) {
        const stockQty = parseInt(updates.stockQuantity);
        updates.inStock = stockQty > 0;
        console.log(`📦 Variant ${id} stock updated to ${stockQty}, inStock set to ${updates.inStock}`);
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

  // Get order by ID (for order confirmation page)
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const items = await storage.getOrderItems(id);
      res.json({ ...order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify payment and complete order (fallback when webhook doesn't fire)
  app.post("/api/orders/:id/verify-payment", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // IDEMPOTENCY: If order already paid, return it
      if (order.status === "paid" || order.status === "completed") {
        console.log("Order already paid/completed:", id);
        const items = await storage.getOrderItems(id);
        return res.json({ ...order, items });
      }

      // Check if order has a Stripe payment intent
      if (!order.stripePaymentIntentId) {
        return res.status(400).json({ error: "No payment intent found for this order" });
      }

      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const stripe = new Stripe(stripeSecretKey);
      
      console.log("Verifying payment intent:", order.stripePaymentIntentId);
      
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      
      console.log("Payment intent status:", paymentIntent.status);

      // If payment not succeeded, return current order status
      if (paymentIntent.status !== "succeeded") {
        const items = await storage.getOrderItems(id);
        return res.json({ 
          ...order, 
          items, 
          paymentStatus: paymentIntent.status 
        });
      }

      // VALIDATION: Verify amount matches
      const expectedAmount = Math.round(parseFloat(order.totalAmount) * 100);
      if (paymentIntent.amount !== expectedAmount) {
        console.error(`Amount mismatch! Stripe: ${paymentIntent.amount}, Order: ${expectedAmount}`);
        return res.status(400).json({ error: "Payment amount mismatch" });
      }

      console.log("Payment verified, completing order:", id);

      // ATOMIC UPDATE: Only update if order is still pending (prevents race with webhook)
      const updateResult = await db.update(orders)
        .set({ 
          status: "paid",
          fulfillmentStatus: "pending",
        })
        .where(and(
          eq(orders.id, id),
          eq(orders.status, "pending")  // Only update if still pending
        ))
        .returning({ id: orders.id });

      // If update didn't affect any rows, order was already completed by webhook
      if (updateResult.length === 0) {
        console.log("Order already completed by webhook, skipping fulfillment");
        const items = await storage.getOrderItems(id);
        return res.json({ 
          ...order, 
          status: "paid", 
          fulfillmentStatus: "pending",
          items 
        });
      }

      // Get order items for stock decrement
      const items = await db.select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
      }).from(orderItems).where(eq(orderItems.orderId, id));

      // Decrement stock for each item
      for (const item of items) {
        const productResults = await db.select({
          stockQuantity: products.stockQuantity,
          inStock: products.inStock,
        }).from(products).where(eq(products.id, item.productId));

        const product = productResults[0];
        if (product && product.inStock) {
          const newQuantity = Math.max(0, (product.stockQuantity ?? 0) - item.quantity);
          await db
            .update(products)
            .set({
              stockQuantity: newQuantity,
              inStock: newQuantity > 0,
            })
            .where(eq(products.id, item.productId));
        }
      }

      console.log("Order finalized via verification:", id);

      // Clear the cart (if session still exists)
      try {
        await storage.clearCart(order.sessionId);
      } catch (e) {
        console.log("Cart already cleared or session expired");
      }

      // Send confirmation email
      try {
        const orderItemsWithDetails = await storage.getOrderItems(id);
        await sendOrderConfirmationEmail({
          ...order,
          status: "paid",
          items: orderItemsWithDetails,
        });
        console.log("Confirmation email sent for order:", id);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      // Return updated order
      const updatedItems = await storage.getOrderItems(id);
      res.json({ 
        ...order, 
        status: "paid", 
        fulfillmentStatus: "pending",
        items: updatedItems 
      });

    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: error.message || "Payment verification failed" });
    }
  });

  app.post("/api/orders/complete", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const shippingData = (req.session as any).shippingData;
      
      console.log("Order completion request:", {
        sessionId,
        hasShippingData: !!shippingData,
        paymentMethod: req.body.paymentMethod,
        stripePaymentIntentId: req.body.stripePaymentIntentId
      });

      if (!shippingData) {
        console.error("Shipping data missing from session");
        return res.status(400).json({ error: "Shipping information not found. Your payment was processed - please contact support with your payment confirmation." });
      }

      // Get cart items with total calculation (server-side for security)
      const cartItems = await storage.getCartItems(sessionId);
      console.log("Cart items for session:", cartItems.length);
      
      if (cartItems.length === 0) {
        console.error("Cart empty for session:", sessionId);
        return res.status(400).json({ error: "Cart is empty. Your payment was processed - please contact support with your payment confirmation." });
      }

      const totalInPence = cartItems.reduce((sum, item) => {
        // Use variant price if variant selected, otherwise use product price
        const price = item.variant?.price ?? item.product.price;
        const priceInPence = Math.round(parseFloat(price) * 100);
        return sum + (priceInPence * item.quantity);
      }, 0);
      const totalAmount = (totalInPence / 100).toFixed(2);

      // STEP 1: Validate and decrement stock for each cart item
      for (const item of cartItems) {
        // Check stock availability
        const productResults = await db.select({
          stockQuantity: products.stockQuantity,
          inStock: products.inStock,
        }).from(products).where(eq(products.id, item.product.id));

        const product = productResults[0];
        if (!product || !product.inStock || (product.stockQuantity ?? 0) < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}. Please update your cart.`);
        }

        // Decrement stock
        const newQuantity = (product.stockQuantity ?? 0) - item.quantity;
        const updateResult = await db
          .update(products)
          .set({
            stockQuantity: newQuantity,
            inStock: newQuantity > 0 ? product.inStock : false
          })
          .where(eq(products.id, item.product.id))
          .returning({ id: products.id });

        // Verify the update succeeded
        if (updateResult.length === 0) {
          throw new Error(`Failed to update stock for ${item.product.name}. Product may have been deleted.`);
        }
      }

      // STEP 2: Create order
      const [createdOrder] = await db.insert(orders).values({
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
        // Use variant price if variant selected, otherwise use product price
        const price = item.variant?.price || item.product.price;
        await db.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: item.product.id,
          quantity: item.quantity,
          priceAtTime: price,
        });
      }

      // Clear the cart (only after successful transaction)
      await storage.clearCart(sessionId);

      // Track successful checkout analytics event (fire-and-forget, isolated from commerce flow)
      try {
        void storage.trackAnalyticsEvent({
          sessionId,
          eventType: 'checkout_complete',
          orderId: createdOrder.id,
        }).catch((error) => {
          console.error('Failed to track checkout analytics (async):', error);
        });
      } catch (error) {
        console.error('Failed to track checkout analytics (sync):', error);
      }

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

  // Analytics routes
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { path, productId, referrer, userAgent } = req.body;
      const sessionId = req.sessionID;

      // Check multiple ways to identify admin users
      const isAdminSession = req.session && (req.session as any).isAdmin === true;
      const hasAdminCookie = req.signedCookies && req.signedCookies.ozeco_admin === 'authenticated';
      const isAdminPath = path && path.startsWith('/admin');
      
      console.log("📊 Analytics track - Path:", path, "Session ID:", sessionId, "isAdminSession:", isAdminSession, "hasAdminCookie:", hasAdminCookie, "isAdminPath:", isAdminPath);
      
      // Skip tracking if user is admin (session OR signed cookie) OR viewing admin pages
      if (isAdminSession || hasAdminCookie || isAdminPath) {
        console.log("✅ Analytics tracking skipped - session:", isAdminSession, "cookie:", hasAdminCookie, "path:", isAdminPath);
        return res.json({ success: true, excluded: true });
      }

      // Get client IP and geolocation
      const ipAddress = getClientIP(req);
      let location: { country: string | null; city: string | null } = { country: null, city: null };
      if (ipAddress) {
        location = await getLocationFromIP(ipAddress);
      }

      // Determine traffic source from referrer
      let trafficSource = "Direct";
      if (referrer) {
        const lowerRef = referrer.toLowerCase();
        if (lowerRef.includes("facebook.com") || lowerRef.includes("fb.com")) trafficSource = "Facebook";
        else if (lowerRef.includes("instagram.com")) trafficSource = "Instagram";
        else if (lowerRef.includes("google.com") || lowerRef.includes("google.co")) trafficSource = "Google";
        else if (lowerRef.includes("twitter.com") || lowerRef.includes("x.com")) trafficSource = "Twitter";
        else if (lowerRef.includes("linkedin.com")) trafficSource = "LinkedIn";
        else if (lowerRef.includes("pinterest.com")) trafficSource = "Pinterest";
        else if (lowerRef.includes("tiktok.com")) trafficSource = "TikTok";
        else if (lowerRef.includes("youtube.com")) trafficSource = "YouTube";
        else trafficSource = "Referral";
      }

      // Upsert visitor session with location data
      await storage.upsertVisitorSession({
        sessionId,
        firstSeen: new Date(),
        lastSeen: new Date(),
        referrer: referrer || null,
        userAgent: userAgent || null,
        trafficSource,
        ipAddress: ipAddress || null,
        country: location.country,
        city: location.city,
      });

      // Track page view
      await storage.trackPageView({
        sessionId,
        path,
        productId: productId || null,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Analytics tracking error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      // Check if user is admin
      console.log("Analytics stats - Session:", req.session);
      console.log("Analytics stats - isAdmin:", (req.session as any)?.isAdmin);
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        console.log("Analytics stats - Access denied, isAdmin:", isAdmin);
        return res.status(403).json({ error: "Unauthorized" });
      }

      const [liveVisitors, pageViewsToday] = await Promise.all([
        storage.getLiveVisitorsCount(),
        storage.getTotalPageViewsToday(),
      ]);

      res.json({
        liveVisitors,
        pageViewsToday,
      });
    } catch (error: any) {
      console.error("Analytics stats error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/top-products", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const topProducts = await storage.getTopProductsViewed(limit);

      res.json(topProducts);
    } catch (error: any) {
      console.error("Top products analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/traffic-sources", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const sources = await storage.getTrafficSources();

      res.json(sources);
    } catch (error: any) {
      console.error("Traffic sources analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/recent-activity", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await storage.getRecentActivity(limit);

      res.json(activity);
    } catch (error: any) {
      console.error("Recent activity analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/locations", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const locations = await storage.getVisitorLocations();
      res.json(locations);
    } catch (error: any) {
      console.error("Visitor locations analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/cart-additions", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const count = await storage.getCartAdditionsToday();
      res.json({ count });
    } catch (error: any) {
      console.error("Cart additions analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/checkouts", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const count = await storage.getSuccessfulCheckoutsToday();
      res.json({ count });
    } catch (error: any) {
      console.error("Successful checkouts analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/page-views-over-time", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const views = await storage.getPageViewsByDateRange(startDate, endDate);
      res.json(views);
    } catch (error: any) {
      console.error("Page views over time analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/product-views-over-time", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const views = await storage.getProductViewsByDateRange(startDate, endDate);
      res.json(views);
    } catch (error: any) {
      console.error("Product views over time analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Google Merchant Centre export
  app.post("/api/admin/export-to-merchant-centre", async (req, res) => {
    try {
      // Check if user is admin
      const isAdmin = req.session && (req.session as any).isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { spreadsheetId } = req.body;
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      // Get Google Sheets client
      const { getUncachableGoogleSheetClient } = await import("./google-sheets");
      const sheets = await getUncachableGoogleSheetClient();

      // Fetch all products with variants
      const allProducts = await storage.getAllProducts();
      
      // Build merchant feed rows
      const merchantFeedRows: string[][] = [];
      
      // Header row (Google Merchant Centre required fields)
      merchantFeedRows.push([
        'id',
        'title',
        'description',
        'link',
        'image_link',
        'price',
        'availability',
        'condition',
        'brand',
        'google_product_category',
        'product_type',
        'mpn'
      ]);

      const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'https://ozeco.co.uk';

      // Helper to safely format and validate price - throws on invalid data
      const formatPrice = (price: string | number | null | undefined, productName: string): string => {
        if (price === null || price === undefined || price === '') {
          throw new Error(`Missing price for product: ${productName}`);
        }
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numericPrice) || numericPrice < 0) {
          throw new Error(`Invalid price (${price}) for product: ${productName}`);
        }
        return numericPrice.toFixed(2);
      };

      for (const product of allProducts) {
        // Get variants for this product
        const variants = await storage.getProductVariants(product.id);

        if (variants.length > 0) {
          // Create a row for each variant with unique IDs
          for (const variant of variants) {
            const variantId = `${product.id}-${variant.id}`;
            const variantTitle = `${product.name} - ${variant.value}`;
            // Use variant price if set, otherwise fall back to product price (nullish coalescing)
            const priceToUse = variant.price ?? product.price;
            const variantPrice = `${formatPrice(priceToUse, variantTitle)} GBP`;
            const availability = variant.stockQuantity > 0 ? 'in stock' : 'out of stock';
            const variantImage = variant.image || product.images[0] || '';

            merchantFeedRows.push([
              variantId,
              variantTitle,
              product.description || '',
              `${baseUrl}/product/${product.slug}`,
              variantImage,
              variantPrice,
              availability,
              'new',
              product.brand,
              'Vehicles & Parts > Vehicles > Motor Vehicles > Motor Bikes',
              `Electric bikes > ${product.category}`,
              variantId
            ]);
          }
        } else {
          // No variants - create single row for the product
          const productPrice = `${formatPrice(product.price, product.name)} GBP`;
          const availability = product.inStock ? 'in stock' : 'out of stock';

          merchantFeedRows.push([
            product.id,
            product.name,
            product.description || '',
            `${baseUrl}/product/${product.slug}`,
            product.images[0] || '',
            productPrice,
            availability,
            'new',
            product.brand,
            'Vehicles & Parts > Vehicles > Motor Vehicles > Motor Bikes',
            `Electric bikes > ${product.category}`,
            product.id
          ]);
        }
      }

      // Clear existing data and write new data to sheet with proper error handling
      try {
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: 'A1:Z',
        });

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'A1',
          valueInputOption: 'RAW',
          requestBody: {
            values: merchantFeedRows,
          },
        });

        res.json({ 
          success: true, 
          message: `Exported ${merchantFeedRows.length - 1} products to Google Merchant Centre feed`,
          rows: merchantFeedRows.length - 1
        });
      } catch (sheetsError: any) {
        console.error("Google Sheets API error:", sheetsError);
        return res.status(500).json({ 
          error: `Failed to write to Google Sheets: ${sheetsError.message || 'Unknown error'}` 
        });
      }
    } catch (error: any) {
      console.error("Export to Merchant Centre error:", error);
      res.status(500).json({ error: error.message || 'Failed to export products' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
