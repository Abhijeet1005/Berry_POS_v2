const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const logger = require('../utils/logger');

/**
 * MongoDB injection prevention
 */
const preventMongoInjection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Potential MongoDB injection attempt detected', {
      ip: req.ip,
      path: req.path,
      key
    });
  }
});

/**
 * XSS prevention
 */
const preventXSS = xss();

/**
 * HTTP Parameter Pollution prevention
 */
const preventHPP = hpp({
  whitelist: [
    'page',
    'limit',
    'sort',
    'fields',
    'status',
    'role',
    'category',
    'dietaryTags',
    'outletId',
    'tenantId'
  ]
});

/**
 * Content Security Policy
 */
const contentSecurityPolicy = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  next();
};

/**
 * Prevent clickjacking
 */
const preventClickjacking = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};

/**
 * Prevent MIME type sniffing
 */
const preventMimeSniffing = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

/**
 * Enable XSS protection
 */
const enableXSSProtection = (req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

/**
 * Referrer policy
 */
const referrerPolicy = (req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * Permissions policy
 */
const permissionsPolicy = (req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  next();
};

/**
 * Detect suspicious patterns in requests
 */
const detectSuspiciousPatterns = (req, res, next) => {
  const suspiciousPatterns = [
    /(\$where|\$ne|\$gt|\$lt)/i, // MongoDB operators
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL keywords
    /(<script|javascript:|onerror=|onload=)/i, // XSS patterns
    /(\.\.\/|\.\.\\)/i, // Path traversal
    /(%00|%0d%0a)/i // Null byte and CRLF
  ];

  const checkString = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkString(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object' && checkObject(obj[key])) {
        return true;
      }
    }
    return false;
  };

  // Check query parameters
  if (checkObject(req.query)) {
    logger.warn('Suspicious pattern detected in query', {
      ip: req.ip,
      path: req.path,
      query: req.query
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid request parameters'
    });
  }

  // Check body
  if (req.body && checkObject(req.body)) {
    logger.warn('Suspicious pattern detected in body', {
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid request body'
    });
  }

  next();
};

/**
 * Request size limiter
 */
const requestSizeLimiter = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    logger.warn('Request size exceeded', {
      ip: req.ip,
      path: req.path,
      size: req.headers['content-length']
    });
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  next();
};

/**
 * IP whitelist/blacklist middleware
 */
const ipFilter = (options = {}) => {
  const { whitelist = [], blacklist = [] } = options;

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check blacklist first
    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      logger.warn('Blocked IP attempted access', {
        ip: clientIP,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check whitelist if configured
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      logger.warn('Non-whitelisted IP attempted access', {
        ip: clientIP,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    next();
  };
};

/**
 * Brute force protection
 */
const bruteForceProtection = () => {
  const attempts = new Map();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour

  return (req, res, next) => {
    const identifier = req.ip + ':' + (req.body?.email || req.body?.username || 'unknown');
    const now = Date.now();

    if (!attempts.has(identifier)) {
      attempts.set(identifier, { count: 1, firstAttempt: now, blockedUntil: null });
      return next();
    }

    const record = attempts.get(identifier);

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000 / 60);
      logger.warn('Blocked user attempted access', {
        identifier,
        remainingTime
      });
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.`
      });
    }

    // Reset if window expired
    if (now - record.firstAttempt > WINDOW_MS) {
      attempts.set(identifier, { count: 1, firstAttempt: now, blockedUntil: null });
      return next();
    }

    // Increment attempts
    record.count++;

    // Block if exceeded max attempts
    if (record.count > MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION;
      logger.warn('User blocked due to excessive attempts', {
        identifier,
        attempts: record.count
      });
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Account temporarily locked.'
      });
    }

    next();
  };
};

module.exports = {
  preventMongoInjection,
  preventXSS,
  preventHPP,
  contentSecurityPolicy,
  preventClickjacking,
  preventMimeSniffing,
  enableXSSProtection,
  referrerPolicy,
  permissionsPolicy,
  detectSuspiciousPatterns,
  requestSizeLimiter,
  ipFilter,
  bruteForceProtection
};
