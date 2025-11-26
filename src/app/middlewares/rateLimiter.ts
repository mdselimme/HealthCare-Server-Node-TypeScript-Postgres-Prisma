import rateLimit from "express-rate-limit";
import config from "../../config";

export const apiLimiter = rateLimit({
    windowMs: Number(config.rate_limiter.api.window_ms), // 15 minutes
    max: Number(config.rate_limiter.api.max_requests), // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: Number(config.rate_limiter.auth.window_ms),
    max: Number(config.rate_limiter.auth.max_requests), // Limit login attempts
    message: "Too many login attempts, please try again later.",
    skipSuccessfulRequests: true,
});