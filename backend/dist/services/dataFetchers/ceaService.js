"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGenerationData = fetchGenerationData;
exports.fetchGridStats = fetchGridStats;
const uuid_1 = require("uuid");
const models_1 = require("../../models");
const helpers_1 = require("../../utils/helpers");
const logger_1 = __importDefault(require("../../logger"));
const DATA_SOURCE = 'cea';
// CEA-grade generation capacities (MW) – India's total installed renewable capacity ~2024
const BASE_CAPACITY = {
    solar: 73000,
    wind: 44700,
    hydro: 46900,
    biomass: 10600,
    geothermal: 50,
};
async function fetchGenerationData() {
    const now = new Date();
    const sf = (0, helpers_1.solarFactor)();
    const generation = {
        solar: parseFloat((BASE_CAPACITY.solar * sf * (0, helpers_1.randomBetween)(0.6, 0.95)).toFixed(2)),
        wind: parseFloat((BASE_CAPACITY.wind * (0, helpers_1.randomBetween)(0.35, 0.75)).toFixed(2)),
        hydro: parseFloat((BASE_CAPACITY.hydro * (0, helpers_1.randomBetween)(0.55, 0.80)).toFixed(2)),
        biomass: parseFloat((BASE_CAPACITY.biomass * (0, helpers_1.randomBetween)(0.55, 0.75)).toFixed(2)),
        geothermal: parseFloat((BASE_CAPACITY.geothermal * (0, helpers_1.randomBetween)(0.60, 0.80)).toFixed(2)),
    };
    const records = Object.entries(generation).map(([source, value_mw]) => ({
        id: (0, uuid_1.v4)(),
        source: source,
        value_mw,
        timestamp: now,
        data_source: DATA_SOURCE,
    }));
    try {
        await models_1.RenewableGeneration.bulkCreate(records.map((r) => ({ ...r })), { ignoreDuplicates: true });
        // Write aggregated row to historical_data
        const total_mw = records.reduce((s, r) => s + r.value_mw, 0);
        const totalInstalledMW = Object.values(BASE_CAPACITY).reduce((a, b) => a + b, 0);
        const renewable_percentage = parseFloat(((total_mw / totalInstalledMW) * 100).toFixed(2));
        await models_1.HistoricalData.create({
            id: (0, uuid_1.v4)(),
            timestamp: now,
            solar_mw: generation['solar'] ?? 0,
            wind_mw: generation['wind'] ?? 0,
            hydro_mw: generation['hydro'] ?? 0,
            biomass_mw: generation['biomass'] ?? 0,
            geothermal_mw: generation['geothermal'] ?? 0,
            total_mw: parseFloat(total_mw.toFixed(2)),
            renewable_percentage,
            data_source: DATA_SOURCE,
        });
        await updateDataSourceStatus(records.length);
        logger_1.default.info(`CEA: stored ${records.length} generation records (total ${total_mw.toFixed(0)} MW).`);
    }
    catch (error) {
        logger_1.default.error('CEA fetchGenerationData DB error:', error);
        await setDataSourceError(String(error));
    }
    return records;
}
function fetchGridStats() {
    return {
        frequency_hz: (0, helpers_1.randomBetween)(49.9, 50.1),
        peak_load_gw: (0, helpers_1.randomBetween)(180, 210),
        grid_availability_percent: (0, helpers_1.randomBetween)(99.0, 99.9),
        timestamp: new Date(),
    };
}
async function updateDataSourceStatus(count) {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + 15 * 60 * 1000); // +15 min
    await models_1.DataSource.upsert({
        id: (0, uuid_1.v4)(),
        name: DATA_SOURCE,
        last_updated: now,
        status: 'active',
        next_update: nextUpdate,
        records_count: count,
        error_message: undefined,
    });
}
async function setDataSourceError(message) {
    await models_1.DataSource.upsert({
        id: (0, uuid_1.v4)(),
        name: DATA_SOURCE,
        last_updated: new Date(),
        status: 'error',
        next_update: null,
        records_count: 0,
        error_message: message,
    });
}
//# sourceMappingURL=ceaService.js.map