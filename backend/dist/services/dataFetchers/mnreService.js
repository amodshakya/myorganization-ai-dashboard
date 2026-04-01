"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCapacityData = fetchCapacityData;
exports.fetchGenerationData = fetchGenerationData;
const uuid_1 = require("uuid");
const models_1 = require("../../models");
const helpers_1 = require("../../utils/helpers");
const logger_1 = __importDefault(require("../../logger"));
const CURRENT_YEAR = new Date().getFullYear();
const DATA_SOURCE = 'mnre';
// Realistic MNRE capacity data (MW) by state and source, based on India's installed capacity reports
const SOLAR_CAPACITY = {
    'Rajasthan': 18500,
    'Gujarat': 10000,
    'Karnataka': 8500,
    'Tamil Nadu': 6000,
    'Andhra Pradesh': 5500,
    'Telangana': 4500,
    'Madhya Pradesh': 4000,
    'Maharashtra': 3500,
    'Uttar Pradesh': 3000,
    'Punjab': 1200,
    'Haryana': 900,
    'Kerala': 800,
    'Odisha': 700,
    'West Bengal': 600,
    'Bihar': 500,
    'Chhattisgarh': 450,
    'Himachal Pradesh': 300,
    'Uttarakhand': 250,
    'Jharkhand': 200,
    'Assam': 150,
    'Delhi': 200,
    'Jammu & Kashmir': 180,
    'Ladakh': 100,
    'Goa': 80,
    'Manipur': 40,
    'Meghalaya': 30,
    'Mizoram': 25,
    'Nagaland': 20,
    'Tripura': 20,
    'Sikkim': 15,
    'Arunachal Pradesh': 10,
};
const WIND_CAPACITY = {
    'Tamil Nadu': 10600,
    'Gujarat': 8500,
    'Rajasthan': 5500,
    'Karnataka': 5000,
    'Maharashtra': 4800,
    'Andhra Pradesh': 4200,
    'Telangana': 1500,
    'Madhya Pradesh': 600,
    'Kerala': 300,
    'Odisha': 200,
    'West Bengal': 100,
    'Himachal Pradesh': 50,
    'Uttarakhand': 30,
    'Punjab': 20,
    'Haryana': 10,
};
const BIOMASS_CAPACITY = {
    'Uttar Pradesh': 1500,
    'Punjab': 900,
    'Maharashtra': 700,
    'Andhra Pradesh': 600,
    'Karnataka': 550,
    'Tamil Nadu': 500,
    'Madhya Pradesh': 450,
    'Gujarat': 400,
    'Rajasthan': 350,
    'Haryana': 300,
    'Bihar': 250,
    'West Bengal': 200,
    'Chhattisgarh': 150,
    'Odisha': 120,
    'Telangana': 100,
};
const SMALL_HYDRO_CAPACITY = {
    'Himachal Pradesh': 2500,
    'Uttarakhand': 1800,
    'Karnataka': 1400,
    'Jammu & Kashmir': 900,
    'Arunachal Pradesh': 800,
    'Kerala': 700,
    'Maharashtra': 600,
    'Sikkim': 450,
    'Manipur': 300,
    'Meghalaya': 250,
    'Ladakh': 200,
    'Assam': 150,
    'Nagaland': 100,
    'Mizoram': 80,
    'Tripura': 60,
};
function buildCapacityRecords(map, sourceType) {
    return Object.entries(map).map(([state, capacity_mw]) => ({
        id: (0, uuid_1.v4)(),
        state,
        source_type: sourceType,
        capacity_mw,
        year: CURRENT_YEAR,
        data_source: DATA_SOURCE,
    }));
}
async function fetchCapacityData() {
    const records = [
        ...buildCapacityRecords(SOLAR_CAPACITY, 'solar'),
        ...buildCapacityRecords(WIND_CAPACITY, 'wind'),
        ...buildCapacityRecords(BIOMASS_CAPACITY, 'biomass'),
        ...buildCapacityRecords(SMALL_HYDRO_CAPACITY, 'hydro'),
    ];
    try {
        // Upsert using bulkCreate – destroy existing MNRE records first for idempotency
        await models_1.RenewableCapacity.destroy({ where: { data_source: DATA_SOURCE } });
        await models_1.RenewableCapacity.bulkCreate(records.map((r) => ({ ...r })), { ignoreDuplicates: true });
        await updateDataSourceStatus(records.length);
        logger_1.default.info(`MNRE: stored ${records.length} capacity records.`);
    }
    catch (error) {
        logger_1.default.error('MNRE fetchCapacityData DB error:', error);
        await setDataSourceError(String(error));
    }
    return records;
}
async function fetchGenerationData() {
    const now = new Date();
    const records = [];
    const capacityMaps = [
        [SOLAR_CAPACITY, 'solar'],
        [WIND_CAPACITY, 'wind'],
        [BIOMASS_CAPACITY, 'biomass'],
        [SMALL_HYDRO_CAPACITY, 'hydro'],
    ];
    for (const [map, source] of capacityMaps) {
        for (const [state, capacity] of Object.entries(map)) {
            const factor = (0, helpers_1.randomBetween)(0.2, 0.8);
            records.push({
                id: (0, uuid_1.v4)(),
                source,
                value_mw: parseFloat((capacity * factor).toFixed(2)),
                timestamp: now,
                state,
                data_source: DATA_SOURCE,
            });
        }
    }
    try {
        await models_1.RenewableGeneration.bulkCreate(records.map((r) => ({ ...r })), { ignoreDuplicates: true });
        logger_1.default.info(`MNRE: stored ${records.length} generation records.`);
    }
    catch (error) {
        logger_1.default.error('MNRE fetchGenerationData DB error:', error);
    }
    return records;
}
async function updateDataSourceStatus(count) {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + 60 * 60 * 1000); // +1h
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
//# sourceMappingURL=mnreService.js.map