import { NextRequest } from "next/server";

// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute default
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetTime < now) {
    // Create new window
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: store[key].resetTime,
    };
  }

  // Increment existing window
  store[key].count += 1;

  if (store[key].count > maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: store[key].resetTime,
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - store[key].count,
    reset: store[key].resetTime,
  };
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwarded?.split(",")[0]?.trim() ||
             realIp ||
             cfConnectingIp ||
             "unknown";

  return ip;
}
