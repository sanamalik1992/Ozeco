# Ozeco E-Commerce — Migration Export README
**Prepared:** April 2026  
**GitHub Target:** https://github.com/sanamalik1992/Ozeco.git

---

## What's in This Export

| File/Folder | Contents |
|---|---|
| `production-db.sql` | Full pg_dump of the database (all tables, indexes, sequences) |
| `csv/` | Every table exported as CSV (15 tables, see below) |
| `images.tar.gz` | All product images, customer photos, brand logos, blog images from `public/` (110 MB) |
| `server-data.tar.gz` | `products.json`, `reviews.json`, `customer-photos.json` (master data files, 288 KB) |
| `ENV_VARS.txt` | Every environment variable name used by the app |

### Database Tables Exported
- `products` (18 rows) — full product catalogue
- `product_variants` (31 rows) — colour/wheel/battery variants
- `reviews` (2,353 rows) — customer reviews
- `customer_photos` (48 rows) — customer photo gallery
- `orders` (2 rows) — placed orders
- `order_items` (2 rows) — line items per order
- `blog_posts` (7 rows) — blog content
- `newsletter_subscribers` — email signups with discount codes
- `visitor_sessions` (844 rows) — analytics sessions
- `page_views` (2,946 rows) — analytics page views
- `analytics_events` (536 rows) — cart/checkout event tracking
- `cart_items`, `favorites`, `referral_codes`, `users`

---

## Cron Jobs / Scheduled Tasks

**None.** There are no cron jobs, background workers, or scheduled tasks in this project. All operations are request-driven (user actions trigger emails, stock updates, etc.).

---

## Stripe Webhook

**Endpoint currently registered with Stripe:**
```
https://www.ozeco.co.uk/api/webhooks/stripe
```

**Events that must be subscribed to:**
- `checkout.session.completed` — finalises order, decrements stock, sends confirmation email
- `payment_intent.succeeded` — fallback order finalisation

**After migrating:** Update this URL in the Stripe Dashboard → Developers → Webhooks to point to your new domain.  
The `STRIPE_WEBHOOK_SECRET` (`whsec_...`) must also be regenerated after changing the endpoint URL.

**Stripe Checkout redirect URLs** (auto-detected from `req.get('host')`, so update automatically):
- Success: `https://[yourdomain]/order-confirmation?session_id={CHECKOUT_SESSION_ID}&orderId={orderId}`
- Cancel: `https://[yourdomain]/checkout?cancelled=true`

---

## PayPal Integration

**PayPal uses the REST SDK** (`@paypal/paypal-server-sdk`) — no webhook registered with PayPal.  
PayPal orders are created and captured client-side via:
- `POST /api/paypal/create-order`
- `POST /api/paypal/capture-order`

PayPal does **not** have a server-side webhook listener in this app — capture is synchronous via the PayPal JS SDK. No URL to update in PayPal dashboard.

After migrating: Update the PayPal app's **Return URL** in the PayPal Developer Dashboard if it's set (most likely it isn't — the SDK handles redirect internally).

---

## Resend Email Setup

**How it currently works on Replit:**  
Resend is connected via the **Replit Connector** (an internal OAuth-style integration). The API key and from-address are fetched at runtime from Replit's internal connector API using `REPL_IDENTITY` and `REPLIT_CONNECTORS_HOSTNAME` tokens.

**File:** `server/resend.ts` — this file contains the Replit-specific connector logic.

**After migrating — replace `server/resend.ts` with:**
```typescript
import { Resend } from 'resend';
export async function getUncachableResendClient() {
  const client = new Resend(process.env.RESEND_API_KEY);
  return { client, fromEmail: process.env.RESEND_FROM_EMAIL };
}
```

**Verified sending domain:** `ozeco.co.uk`  
**From address:** `support@ozeco.co.uk`  
**Reply-to / support inbox:** `support@ozeco.co.uk`

**Emails sent:**
1. Order confirmation — triggered when Stripe `checkout.session.completed` fires
2. Shipping confirmation (with tracking number) — triggered when admin marks order fulfilled in `/admin`

---

## Replit-Specific Features Used

| Feature | Used? | Notes |
|---|---|---|
| Replit DB (key-value store) | **No** | Not used — all data in Neon Postgres |
| Replit Auth | **No** | Custom cookie-based admin auth only |
| Replit Object Storage | **No** | Images on local filesystem (`public/`) |
| Replit Secrets | **Yes** | All env vars stored here — get values before migrating |
| Replit Connector (Resend) | **Yes** | Must replace with direct Resend SDK after migrating (see above) |
| Replit Connector (Google Analytics) | **Installed but unused** | GA is hardcoded in `index.html` directly |

---

## Key Things to Fix During Migration

1. **Replace Resend connector** — swap `server/resend.ts` to use direct `RESEND_API_KEY` (3 lines, see above)
2. **Update Stripe webhook URL** — change in Stripe Dashboard and regenerate webhook secret
3. **Move images to object storage** — extract `images.tar.gz`, upload to Cloudflare R2 or similar, update image paths in `products.json` and the database
4. **Consolidate to one database** — import `production-db.sql` into your new Neon project
5. **Remove `products.json` as a data source** — the `/api/force-update-production` endpoint exists only because of the two-DB problem. Once you have one DB, delete it
6. **Harden admin auth** — add rate limiting to `POST /api/admin/login`, hash the password with bcrypt

---

## Data Sync Note

The dev database (this export) and the production database are separate Neon instances kept in sync via the `/api/force-update-production` endpoint. The export in `production-db.sql` is from the **dev DB**. Live order data (the 2 orders) is in the production DB and may differ slightly. Export the production DB directly via Neon Console → your production project → Export.
