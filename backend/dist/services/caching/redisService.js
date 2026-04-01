"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = __importDefault(require("../../config/redis"));
const logger_1 = __importDefault(require("../../logger"));
class RedisService {
    async get(key) {
        try {
            if (!redis_1.default.isOpen)
                return null;
            const value = await redis_1.default.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.default.warn(`Redis GET failed for key "${key}":`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (!redis_1.default.isOpen)
                return;
            await redis_1.default.setEx(key, ttlSeconds, JSON.stringify(value));
        }
        catch (error) {
            logger_1.default.warn(`Redis SET failed for key "${key}":`, error);
        }
    }
    async delete(key) {
        try {
            if (!redis_1.default.isOpen)
                return;
            await redis_1.default.del(key);
        }
        catch (error) {
            logger_1.default.warn(`Redis DEL failed for key "${key}":`, error);
        }
    }
    async flush() {
        try {
            if (!redis_1.default.isOpen)
                return;
            await redis_1.default.flushDb();
            logger_1.default.info('Redis cache flushed.');
        }
        catch (error) {
            logger_1.default.warn('Redis FLUSHDB failed:', error);
        }
    }
    async invalidatePattern(pattern) {
        try {
            if (!redis_1.default.isOpen)
                return;
            const keys = await redis_1.default.keys(pattern);
            if (keys.length > 0) {
                await redis_1.default.del(keys);
            }
        }
        catch (error) {
            logger_1.default.warn(`Redis pattern invalidation failed for "${pattern}":`, error);
        }
    }
}
exports.redisService = new RedisService();
exports.default = exports.redisService;
//# sourceMappingURL=redisService.js.map