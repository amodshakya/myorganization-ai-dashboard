"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentGeneration = getCurrentGeneration;
exports.getGenerationHistory = getGenerationHistory;
const sequelize_1 = require("sequelize");
const models_1 = require("../../models");
const redisService_1 = require("../../services/caching/redisService");
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
async function getCurrentGeneration(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.CURRENT_GENERATION);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        // Get latest record per source
        const rows = await models_1.RenewableGeneration.findAll({
            attributes: [
                'source',
                [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('timestamp')), 'timestamp'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('value_mw')), 'value_mw'],
                'data_source',
            ],
            group: ['source', 'data_source'],
            order: [[(0, sequelize_1.literal)('"timestamp"'), 'DESC']],
            raw: true,
        });
        const data = rows.map((r) => ({
            id: '',
            source: r.source,
            value_mw: parseFloat(parseFloat(r.value_mw).toFixed(2)),
            timestamp: new Date(r.timestamp),
            data_source: r.data_source,
        }));
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.CURRENT_GENERATION, data, constants_1.CACHE_TTL.CURRENT_GENERATION);
        const body = { success: true, data, timestamp: new Date().toISOString() };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('generationController.getCurrentGeneration error:', error);
        next(error);
    }
}
async function getGenerationHistory(req, res, next) {
    try {
        const period = req.query.period || '24h';
        const cacheKey = period === '7d' ? constants_1.CACHE_KEYS.HISTORY_7D : period === '30d' ? constants_1.CACHE_KEYS.HISTORY_30D : constants_1.CACHE_KEYS.HISTORY_24H;
        const cached = await redisService_1.redisService.get(cacheKey);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        const hoursMap = { '24h': 24, '7d': 168, '30d': 720 };
        const hours = hoursMap[period] ?? 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const rows = await models_1.HistoricalData.findAll({
            where: { timestamp: { [sequelize_1.Op.gte]: since } },
            order: [['timestamp', 'ASC']],
            raw: true,
        });
        await redisService_1.redisService.set(cacheKey, rows, constants_1.CACHE_TTL.HISTORY);
        const body = { success: true, data: rows, timestamp: new Date().toISOString() };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('generationController.getGenerationHistory error:', error);
        next(error);
    }
}
//# sourceMappingURL=generationController.js.map