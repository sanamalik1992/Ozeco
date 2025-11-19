interface GeolocationData {
  country: string | null;
  city: string | null;
}

export async function getLocationFromIP(ipAddress: string): Promise<GeolocationData> {
  // Skip localhost/private IPs
  if (!ipAddress || ipAddress === '::1' || ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return { country: null, city: null };
  }

  try {
    // Use ipapi.co free tier (1000 requests/day, no API key needed)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        'User-Agent': 'Ozeco Analytics/1.0'
      },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (!response.ok) {
      console.warn(`Geolocation lookup failed for ${ipAddress}: ${response.status}`);
      return { country: null, city: null };
    }

    const data = await response.json();
    
    return {
      country: data.country_name || null,
      city: data.city || null,
    };
  } catch (error: any) {
    console.warn(`Geolocation error for ${ipAddress}:`, error.message);
    return { country: null, city: null };
  }
}

export function getClientIP(req: any): string | null {
  // Check various headers for the real client IP
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwarded.split(',');
    return ips[0].trim();
  }
  
  return req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         null;
}
