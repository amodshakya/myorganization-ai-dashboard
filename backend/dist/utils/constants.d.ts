export declare const INDIAN_STATES: string[];
export declare const ENERGY_SOURCES: string[];
export declare const CACHE_TTL: {
    DASHBOARD_SUMMARY: number;
    CURRENT_GENERATION: number;
    CAPACITY: number;
    HISTORY: number;
    DATA_SOURCES: number;
    ENVIRONMENTAL: number;
};
export declare const CACHE_KEYS: {
    DASHBOARD_SUMMARY: string;
    CURRENT_GENERATION: string;
    CAPACITY_BY_STATE: string;
    CAPACITY_BY_TYPE: string;
    HISTORY_24H: string;
    HISTORY_7D: string;
    HISTORY_30D: string;
    DATA_SOURCES: string;
    CARBON_AVOIDED: string;
};
/** Tons of CO2 avoided per MWh of renewable energy vs coal baseline */
export declare const CO2_FACTOR = 0.82;
/** Trees needed to absorb 1 ton of CO2 per year */
export declare const TREES_PER_TON_CO2 = 45;
/** Average car emits ~4.6 tons CO2 per year */
export declare const CO2_TONS_PER_CAR_YEAR = 4.6;
export declare const API_REFRESH_INTERVALS: {
    MNRE: string;
    CEA: string;
    MINISTRY_OF_POWER: string;
};
export declare const INDIA_RENEWABLE_TARGET_2030_GW = 500;
export declare const STATE_CODES: Record<string, string>;
//# sourceMappingURL=constants.d.ts.map