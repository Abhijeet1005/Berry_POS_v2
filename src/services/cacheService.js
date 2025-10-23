const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache service wrapper for Redis operations
 */
class CacheService {
  /**
   * Get Redis client safely
   */
  getClient() {
    try {
      return getRedisClient();
    } catch (error) {
      logger.warn('Redis client not available:', error.message);
      return null;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const client = this.getClient();
      if (!client) return null;

      const value = await client.get(key);
      
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
      const client = this.getClient();
      if (!client) return false;

      const serialized = JSON.stringify(value);
      await client.setEx(key, ttl, serialized);
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
      const client = this.getClient();
      if (!client) return false;

      await client.del(key);
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
      const client = this.getClient();
      if (!client) return 0;

      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
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
      const client = this.getClient();
      if (!client) return false;

      const result = await client.exists(key);
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
      const client = this.getClient();
      if (!client) return false;

      await client.expire(key, ttl);
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
      const client = this.getClient();
      if (!client) return null;

      return await client.incr(key);
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
      const client = this.getClient();
      if (!client) return null;

      return await client.decr(key);
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
      const client = this.getClient();
      if (!client) return [];

      const values = await client.mGet(keys);
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
      const client = this.getClient();
      if (!client) return false;

      const multi = client.multi();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serialized = JSON.stringify(value);
        multi.setEx(key, ttl, serialized);
      });
      
      await multi.exec();
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
      const client = this.getClient();
      if (!client) return false;

      await client.flushAll();
      logger.warn('Cache flushed - all keys deleted');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();
