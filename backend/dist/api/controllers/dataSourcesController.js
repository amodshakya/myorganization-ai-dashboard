"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSourceStatus = getDataSourceStatus;
const models_1 = require("../../models");
const redisService_1 = require("../../services/caching/redisService");
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
async function getDataSourceStatus(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.DATA_SOURCES);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        const sources = await models_1.DataSource.findAll({ raw: true });
        const data = sources.map((s) => ({
            name: s.name,
            last_updated: s.last_updated,
            status: s.status,
            next_update: s.next_update,
            records_count: s.records_count,
        }));
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.DATA_SOURCES, data, constants_1.CACHE_TTL.DATA_SOURCES);
        const body = {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('dataSourcesController.getDataSourceStatus error:', error);
        next(error);
    }
}
//# sourceMappingURL=dataSourcesController.js.map