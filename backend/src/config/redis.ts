import { createClient, RedisClientType } from 'redis';
import logger from '../logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient: RedisClientType = createClient({ url: REDIS_URL }) as RedisClientType;

redisClient.on('error', (err: Error) => {
  logger.error('Redis client error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected.');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Non-fatal: app can run without Redis (cache miss fallback)
  }
}

export default redisClient;
