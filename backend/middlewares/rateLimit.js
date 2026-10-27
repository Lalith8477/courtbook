import rateLimit from "express-rate-limit"

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user._id.toString(),
    message: { message: "Too many searches. Please wait a minute and try again" }
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again after 15 minutes" }
})