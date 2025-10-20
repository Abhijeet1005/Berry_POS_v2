const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later'
      )
    );
  }
});

/**
 * Authentication endpoints rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many authentication attempts, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many authentication attempts, please try again later'
      )
    );
  }
});

/**
 * Admin endpoints rate limiter (more lenient)
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many admin requests, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many admin requests, please try again later'
      )
    );
  }
});

/**
 * Payment endpoints rate limiter (very strict)
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: errorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many payment requests, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many payment requests, please try again later'
      )
    );
  }
});

/**
 * Create custom rate limiter
 */
const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(
        errorResponse(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests, please try again later'
        )
      );
    }
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter,
  paymentLimiter,
  createRateLimiter
};
