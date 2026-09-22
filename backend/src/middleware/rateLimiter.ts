import rateLimit from 'express-rate-limit';

const windowMs = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 15 * 60 * 1000; // Default 15 minutes

const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
  : 100; // Default 100 requests per window

export const verificationRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: `Too many verification attempts from this IP address. Rate limit exceeded (${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes).`,
  },
});

