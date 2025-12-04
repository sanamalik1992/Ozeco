import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedProductionIfEmpty } from "./seed-production";

const app = express();

// Trust proxy for Replit deployment (needed for secure cookies behind HTTPS proxy)
app.set('trust proxy', 1);

// Cookie parser middleware with secret for signed cookies (must be before session)
app.use(cookieParser(process.env.SESSION_SECRET || 'ozeco-secret-key-change-in-production'));

// Session configuration - secure: 'auto' works for both HTTP (dev) and HTTPS (prod)
app.use(session({
  secret: process.env.SESSION_SECRET || 'ozeco-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: 'auto', // Auto-detects HTTPS - works in dev AND production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// CRITICAL: Stripe webhook MUST receive raw body for signature verification
// Mount webhook route BEFORE express.json() middleware
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  // Store the raw body for Stripe signature verification
  req.rawBody = req.body;
  // Let the actual handler in routes.ts process the webhook
  next();
});

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Serve static files before Vite middleware
  app.use("/blog", express.static(path.resolve(process.cwd(), "public/blog")));
  app.use("/customer-photos", express.static(path.resolve(process.cwd(), "public/customer-photos")));
  app.use("/products", express.static(path.resolve(process.cwd(), "public/products")));
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Auto-seed production database if empty
    await seedProductionIfEmpty();
  });
})();
