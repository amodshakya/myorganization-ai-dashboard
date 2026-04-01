"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarbonAvoided = getCarbonAvoided;
const ministryOfPowerService_1 = require("../../services/dataFetchers/ministryOfPowerService");
const redisService_1 = require("../../services/caching/redisService");
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
async function getCarbonAvoided(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.CARBON_AVOIDED);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        const metrics = await (0, ministryOfPowerService_1.fetchEnvironmentalMetrics)();
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.CARBON_AVOIDED, metrics, constants_1.CACHE_TTL.ENVIRONMENTAL);
        const body = {
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
        };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('environmentController.getCarbonAvoided error:', error);
        next(error);
    }
}
//# sourceMappingURL=environmentController.js.map