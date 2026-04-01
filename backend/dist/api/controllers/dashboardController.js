"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = getSummary;
const sequelize_1 = require("sequelize");
const models_1 = require("../../models");
const redisService_1 = require("../../services/caching/redisService");
const ceaService_1 = require("../../services/dataFetchers/ceaService");
const helpers_1 = require("../../utils/helpers");
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
async function getSummary(req, res, next) {
    try {
        const cached = await redisService_1.redisService.get(constants_1.CACHE_KEYS.DASHBOARD_SUMMARY);
        if (cached) {
            const body = {
                success: true,
                data: cached,
                timestamp: new Date().toISOString(),
            };
            res.json(body);
            return;
        }
        // Total installed capacity (GW)
        const capacityResult = await models_1.RenewableCapacity.findAll({
            attributes: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('capacity_mw')), 'total']],
            raw: true,
        });
        const totalCapacityMW = parseFloat(capacityResult[0]?.total ?? '0');
        // Latest generation per source
        const genRows = await models_1.RenewableGeneration.findAll({
            attributes: [
                'source',
                [(0, sequelize_1.fn)('MAX', (0, sequelize_1.col)('timestamp')), 'latest_ts'],
                [(0, sequelize_1.fn)('AVG', (0, sequelize_1.col)('value_mw')), 'avg_mw'],
            ],
            group: ['source'],
            raw: true,
        });
        const currentGenerationMW = genRows.reduce((s, r) => s + parseFloat(r.avg_mw ?? '0'), 0);
        const renewablePercent = totalCapacityMW > 0
            ? parseFloat(((currentGenerationMW / totalCapacityMW) * 100).toFixed(2))
            : 0;
        // CO2 avoided estimate based on generation (MWh proxy)
        const co2AvoidedTons = parseFloat((currentGenerationMW * constants_1.CO2_FACTOR).toFixed(2));
        const gridStats = (0, ceaService_1.fetchGridStats)();
        const dataSources = await models_1.DataSource.findAll({ raw: true });
        const dataSourceStatuses = dataSources.map((ds) => ({
            name: ds.name,
            last_updated: ds.last_updated,
            status: ds.status,
            next_update: ds.next_update,
            records_count: ds.records_count,
        }));
        const summary = {
            total_capacity_gw: (0, helpers_1.mwToGw)(totalCapacityMW),
            current_generation_gw: (0, helpers_1.mwToGw)(currentGenerationMW),
            renewable_percentage: renewablePercent,
            co2_avoided_tons: co2AvoidedTons,
            peak_load_gw: gridStats.peak_load_gw,
            grid_frequency: gridStats.frequency_hz,
            data_sources: dataSourceStatuses,
        };
        await redisService_1.redisService.set(constants_1.CACHE_KEYS.DASHBOARD_SUMMARY, summary, constants_1.CACHE_TTL.DASHBOARD_SUMMARY);
        const body = {
            success: true,
            data: summary,
            timestamp: new Date().toISOString(),
        };
        res.json(body);
    }
    catch (error) {
        logger_1.default.error('dashboardController.getSummary error:', error);
        next(error);
    }
}
//# sourceMappingURL=dashboardController.js.map