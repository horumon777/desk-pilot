/**
 * Simple in-memory rate limiter for API routes.
 * Limits requests per IP within a sliding time window.
 * Note: resets on server restart / new deployment. Fine for Vercel serverless.
 */

const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  {
    maxRequests = 10,
    windowMs = 60 * 1000,
  }: { maxRequests?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

/**
 * Extract client IP from request headers.
 * Works with Vercel (x-forwarded-for) and direct access.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
