/**
 * rateLimit.ts — In-memory rate limiting
 * For production, use Redis-based solution like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number; // Optional: block after exceeding limit
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  blocked?: boolean;
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
      blocked: true,
    };
  }
  
  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    // Block if configured
    if (config.blockDurationMs) {
      entry.blockedUntil = now + config.blockDurationMs;
    }
    
    rateLimitStore.set(key, entry);
    
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      blocked: !!config.blockDurationMs,
    };
  }
  
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  adminLogin: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes after 5 failed attempts
  },
  studentLogin: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  },
  enquiry: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  studentApplication: {
    maxRequests: 2,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (Vercel, Cloudflare, etc.)
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
  return ip.trim();
}

