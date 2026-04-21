import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "ozeco_session";
const NINETY_DAYS = 60 * 60 * 24 * 90;

/**
 * Mint a server-side session cookie on the first visit. The cookie is an
 * httpOnly random UUID keyed to the cart_items.session_id column. It has
 * nothing to do with login — every anonymous visitor gets one and keeps
 * their cart for 90 days.
 *
 * Forwards the freshly-minted cookie into the current request's Cookie
 * header so route handlers / RSCs on this same request can read it,
 * while also setting it on the response for the browser to persist.
 */
export function middleware(req: NextRequest) {
  const existing = req.cookies.get(SESSION_COOKIE);
  if (existing?.value) return NextResponse.next();

  const id = crypto.randomUUID();

  const forwardedHeaders = new Headers(req.headers);
  const existingCookieHeader = forwardedHeaders.get("cookie") ?? "";
  const cookieLine = `${SESSION_COOKIE}=${id}`;
  forwardedHeaders.set(
    "cookie",
    existingCookieHeader ? `${existingCookieHeader}; ${cookieLine}` : cookieLine
  );

  const res = NextResponse.next({ request: { headers: forwardedHeaders } });
  res.cookies.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: NINETY_DAYS,
    path: "/",
  });
  return res;
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static files, webhooks, and favicons.
    "/((?!_next/static|_next/image|_next/data|api/webhooks|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
