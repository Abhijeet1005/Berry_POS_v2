const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * Cache middleware for GET requests
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = null,
    condition = null
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition if provided
    if (condition && !condition(req)) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : generateDefaultKey(req);

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(cached);
      }

      logger.debug(`Cache miss: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = (data) => {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch(err => {
          logger.error('Failed to cache response:', err);
        });

        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Generate default cache key from request
 */
const generateDefaultKey = (req) => {
  const parts = [
    'api',
    req.tenantId || 'global',
    req.path,
    JSON.stringify(req.query)
  ];

  return parts.join(':');
};

/**
 * Cache invalidation middleware
 */
const invalidateCacheMiddleware = (options = {}) => {
  const {
    patterns = [],
    entityExtractor = null
  } = options;

  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after response
    res.json = async (data) => {
      try {
        // Invalidate specified patterns
        for (const pattern of patterns) {
          const resolvedPattern = typeof pattern === 'function' 
            ? pattern(req) 
            : pattern;
          
          await cacheService.delPattern(resolvedPattern);
        }

        // Invalidate entity cache if extractor provided
        if (entityExtractor) {
          const { entity, entityId } = entityExtractor(req);
          if (entity && entityId && req.tenantId) {
            await cacheService.invalidateEntity(entity, entityId, req.tenantId);
          }
        }
      } catch (error) {
        logger.error('Cache invalidation error:', error);
      }

      // Send response
      return originalJson(data);
    };

    next();
  };
};

/**
 * Tenant cache invalidation middleware
 */
const invalidateTenantCache = async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    try {
      if (req.tenantId) {
        await cacheService.invalidateTenant(req.tenantId);
      }
    } catch (error) {
      logger.error('Tenant cache invalidation error:', error);
    }

    return originalJson(data);
  };

  next();
};

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
  invalidateTenantCache
};
