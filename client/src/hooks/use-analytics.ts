import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export function useAnalytics(productId?: string) {
  const [location] = useLocation();
  const hasTracked = useRef(false);
  const trackedProductId = useRef<string | undefined>();

  useEffect(() => {
    // Track page view only once per location
    // For product pages, wait until productId is available
    const trackPageView = async () => {
      // If we're on a product page (productId expected but not yet loaded), wait
      if (location.startsWith("/product/") && !productId) {
        return;
      }

      // Prevent duplicate tracking for same location + productId combination
      if (hasTracked.current && trackedProductId.current === productId) {
        return;
      }

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: location,
            productId: productId || null,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          }),
        });
        
        hasTracked.current = true;
        trackedProductId.current = productId;
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug("Analytics tracking failed:", error);
      }
    };

    trackPageView();
  }, [location, productId]);

  // Reset tracking flag when location changes
  useEffect(() => {
    hasTracked.current = false;
    trackedProductId.current = undefined;
  }, [location]);
}
