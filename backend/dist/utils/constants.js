"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATE_CODES = exports.INDIA_RENEWABLE_TARGET_2030_GW = exports.API_REFRESH_INTERVALS = exports.CO2_TONS_PER_CAR_YEAR = exports.TREES_PER_TON_CO2 = exports.CO2_FACTOR = exports.CACHE_KEYS = exports.CACHE_TTL = exports.ENERGY_SOURCES = exports.INDIAN_STATES = void 0;
exports.INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu & Kashmir',
    'Ladakh',
];
exports.ENERGY_SOURCES = [
    'solar',
    'wind',
    'hydro',
    'biomass',
    'geothermal',
];
exports.CACHE_TTL = {
    DASHBOARD_SUMMARY: 300, // 5 minutes
    CURRENT_GENERATION: 60, // 1 minute
    CAPACITY: 3600, // 1 hour
    HISTORY: 600, // 10 minutes
    DATA_SOURCES: 120, // 2 minutes
    ENVIRONMENTAL: 300, // 5 minutes
};
exports.CACHE_KEYS = {
    DASHBOARD_SUMMARY: 'dashboard:summary',
    CURRENT_GENERATION: 'generation:current',
    CAPACITY_BY_STATE: 'capacity:by-state',
    CAPACITY_BY_TYPE: 'capacity:by-type',
    HISTORY_24H: 'history:24h',
    HISTORY_7D: 'history:7d',
    HISTORY_30D: 'history:30d',
    DATA_SOURCES: 'datasources:status',
    CARBON_AVOIDED: 'environment:carbon-avoided',
};
/** Tons of CO2 avoided per MWh of renewable energy vs coal baseline */
exports.CO2_FACTOR = 0.82;
/** Trees needed to absorb 1 ton of CO2 per year */
exports.TREES_PER_TON_CO2 = 45;
/** Average car emits ~4.6 tons CO2 per year */
exports.CO2_TONS_PER_CAR_YEAR = 4.6;
exports.API_REFRESH_INTERVALS = {
    MNRE: '0 * * * *', // Every hour
    CEA: '*/15 * * * *', // Every 15 minutes
    MINISTRY_OF_POWER: '0 0 * * *', // Every 24 hours
};
exports.INDIA_RENEWABLE_TARGET_2030_GW = 500;
exports.STATE_CODES = {
    'Andhra Pradesh': 'AP',
    'Arunachal Pradesh': 'AR',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Goa': 'GA',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Mizoram': 'MZ',
    'Nagaland': 'NL',
    'Odisha': 'OD',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Sikkim': 'SK',
    'Tamil Nadu': 'TN',
    'Telangana': 'TS',
    'Tripura': 'TR',
    'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK',
    'West Bengal': 'WB',
    'Delhi': 'DL',
    'Jammu & Kashmir': 'JK',
    'Ladakh': 'LA',
};
//# sourceMappingURL=constants.js.map