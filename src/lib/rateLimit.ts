/**
 * @deprecated Import from "@/lib/security/rate-limit" directly.
 * This barrel re-export exists for backwards compatibility.
 */
export type { RateLimitConfig, RateLimitResult } from "@/lib/security/rate-limit";
export { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/security/rate-limit";
