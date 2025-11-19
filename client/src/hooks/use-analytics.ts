import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export function useAnalytics(productId?: string) {
  const [location] = useLocation();
  const lastTrackedKey = useRef<string>("");
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get canonical URL path from browser
    const fullPath = window.location.pathname + window.location.search + window.location.hash;
    
    // For product pages, track by path only (ignore productId in key to prevent double-counting)
    // For other pages, include full URL to track filter/sort changes
    const isProductPage = location.startsWith("/product/");
    const trackingKey = isProductPage ? fullPath : `${fullPath}|${productId || ""}`;
    
    // Prevent duplicate tracking for same page
    if (lastTrackedKey.current === trackingKey) {
      return;
    }

    // Track page view only once per unique URL
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: fullPath,
            productId: productId || null,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          }),
        });
        
        // Update last tracked key after successful tracking
        lastTrackedKey.current = trackingKey;
        
        // Clear any pending fallback timeout since we successfully tracked
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug("Analytics tracking failed:", error);
      }
    };

    // For product pages, wait briefly for productId but track anyway after timeout
    if (isProductPage && !productId) {
      // Clear any existing timeout
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      
      // Wait up to 1000ms for productId to load, then track anyway
      fallbackTimeoutRef.current = setTimeout(() => {
        // Only fire fallback if we haven't tracked this page yet
        if (lastTrackedKey.current !== trackingKey) {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: fullPath,
              productId: null,
              referrer: document.referrer,
              userAgent: navigator.userAgent,
            }),
          }).then(() => {
            // Use path-only key to prevent double-counting when productId loads later
            lastTrackedKey.current = trackingKey;
          }).catch(() => {});
        }
        fallbackTimeoutRef.current = null;
      }, 1000);
      
      return;
    }

    // Track immediately for non-product pages or when productId is available
    trackPageView();

    // Cleanup function to clear timeout
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [location, productId]);
}
