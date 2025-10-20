const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache service wrapper for Redis operations
 */
class CacheService {
  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      
      if (value) {
        return JSON.parse(value);
      }
      
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      return keys.length;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, ttl) {
    try {
      await redis.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return null;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    try {
      return await redis.decr(key);
    } catch (error) {
      logger.error('Cache decrement error:', error);
      return null;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys) {
    try {
      const values = await redis.mget(keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return [];
    }
  }

  /**
   * Set multiple keys
   */
  async mset(keyValuePairs, ttl = 3600) {
    try {
      const pipeline = redis.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttl, serialized);
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Cache-aside pattern: Get from cache or execute function
   */
  async getOrSet(key, fetchFunction, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      
      if (cached !== null) {
        return cached;
      }
      
      // If not in cache, execute function
      const value = await fetchFunction();
      
      // Store in cache
      await this.set(key, value, ttl);
      
      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      // If cache fails, still return the fetched value
      return await fetchFunction();
    }
  }

  /**
   * Invalidate cache for tenant
   */
  async invalidateTenant(tenantId) {
    const pattern = `*:tenant:${tenantId}:*`;
    return await this.delPattern(pattern);
  }

  /**
   * Invalidate cache for entity
   */
  async invalidateEntity(entity, entityId, tenantId) {
    const patterns = [
      `${entity}:${entityId}:*`,
      `${entity}:list:tenant:${tenantId}:*`,
      `${entity}:*:tenant:${tenantId}:*`
    ];
    
    let count = 0;
    for (const pattern of patterns) {
      count += await this.delPattern(pattern);
    }
    
    return count;
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, ...parts) {
    return [prefix, ...parts].filter(Boolean).join(':');
  }

  /**
   * Flush all cache (use with caution)
   */
  async flushAll() {
    try {
      await redis.flushall();
      logger.warn('Cache flushed - all keys deleted');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();
