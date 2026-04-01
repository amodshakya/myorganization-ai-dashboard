"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapacityByState = getCapacityByState;
exports.getCapacityByType = getCapacityByType;
const sequelize_1 = require("sequelize");
const models_1 = require("../../models");
const redisService_1 = require("../../services/caching/redisService");
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
async function getCapacityByState(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.CAPACITY_BY_STATE);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        const rows = await models_1.RenewableCapacity.findAll({
            attributes: [
                'state',
                'source_type',
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('capacity_mw')), 'capacity_mw'],
            ],
            group: ['state', 'source_type'],
            raw: true,
        });
        const stateMap = {};
        for (const row of rows) {
            if (!stateMap[row.state]) {
                stateMap[row.state] = { state: row.state, solar_mw: 0, wind_mw: 0, hydro_mw: 0, biomass_mw: 0, geothermal_mw: 0, total_mw: 0 };
            }
            const mw = parseFloat(row.capacity_mw);
            const key = `${row.source_type}_mw`;
            if (key in stateMap[row.state]) {
                stateMap[row.state][key] += mw;
            }
            stateMap[row.state].total_mw += mw;
        }
        const data = Object.values(stateMap).sort((a, b) => b.total_mw - a.total_mw);
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.CAPACITY_BY_STATE, data, constants_1.CACHE_TTL.CAPACITY);
        const body = { success: true, data, timestamp: new Date().toISOString() };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('capacityController.getCapacityByState error:', error);
        next(error);
    }
}
async function getCapacityByType(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.CAPACITY_BY_TYPE);
        if (cached) {
            res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
            return;
        }
        const rows = await models_1.RenewableCapacity.findAll({
            attributes: [
                'source_type',
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('capacity_mw')), 'total_capacity_mw'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'state_count'],
            ],
            group: ['source_type'],
            raw: true,
        });
        const totalMW = rows.reduce((s, r) => s + parseFloat(r.total_capacity_mw), 0);
        const data = rows.map((r) => ({
            source_type: r.source_type,
            total_capacity_mw: parseFloat(parseFloat(r.total_capacity_mw).toFixed(2)),
            total_capacity_gw: parseFloat((parseFloat(r.total_capacity_mw) / 1000).toFixed(2)),
            state_count: parseInt(r.state_count, 10),
            percentage: parseFloat(((parseFloat(r.total_capacity_mw) / totalMW) * 100).toFixed(2)),
        })).sort((a, b) => b.total_capacity_mw - a.total_capacity_mw);
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.CAPACITY_BY_TYPE, data, constants_1.CACHE_TTL.CAPACITY);
        const body = { success: true, data, timestamp: new Date().toISOString() };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('capacityController.getCapacityByType error:', error);
        next(error);
    }
}
//# sourceMappingURL=capacityController.js.map