import redisClient from '../../config/redis';
import logger from '../../logger';

class RedisService {
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisClient.isOpen) return null;
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn(`Redis GET failed for key "${key}":`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.warn(`Redis SET failed for key "${key}":`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(key);
    } catch (error) {
      logger.warn(`Redis DEL failed for key "${key}":`, error);
    }
  }

  async flush(): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.flushDb();
      logger.info('Redis cache flushed.');
    } catch (error) {
      logger.warn('Redis FLUSHDB failed:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.warn(`Redis pattern invalidation failed for "${pattern}":`, error);
    }
  }
}

export const redisService = new RedisService();
export default redisService;
