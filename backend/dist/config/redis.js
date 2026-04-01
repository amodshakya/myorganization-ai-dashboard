"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../logger"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = (0, redis_1.createClient)({ url: REDIS_URL });
redisClient.on('error', (err) => {
    logger_1.default.error('Redis client error:', err);
});
redisClient.on('connect', () => {
    logger_1.default.info('Redis client connected.');
});
redisClient.on('reconnecting', () => {
    logger_1.default.warn('Redis client reconnecting...');
});
async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    }
    catch (error) {
        logger_1.default.error('Failed to connect to Redis:', error);
        // Non-fatal: app can run without Redis (cache miss fallback)
    }
}
exports.default = redisClient;
//# sourceMappingURL=redis.js.map