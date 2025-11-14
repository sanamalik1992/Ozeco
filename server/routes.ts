import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema } from "@shared/schema";
import Stripe from "stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault, isPayPalConfigured } from "./paypal";

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

  const httpServer = createServer(app);

  return httpServer;
}
