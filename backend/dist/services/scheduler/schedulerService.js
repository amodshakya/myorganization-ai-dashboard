"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleMNREFetch = scheduleMNREFetch;
exports.scheduleCEAFetch = scheduleCEAFetch;
exports.scheduleMinistryFetch = scheduleMinistryFetch;
exports.initializeSchedulers = initializeSchedulers;
exports.runInitialFetch = runInitialFetch;
exports.stopAllSchedulers = stopAllSchedulers;
const node_cron_1 = __importDefault(require("node-cron"));
const mnreService = __importStar(require("../dataFetchers/mnreService"));
const ceaService = __importStar(require("../dataFetchers/ceaService"));
const ministryService = __importStar(require("../dataFetchers/ministryOfPowerService"));
const constants_1 = require("../../utils/constants");
const logger_1 = __importDefault(require("../../logger"));
let mnreTask = null;
let ceaTask = null;
let ministryTask = null;
function scheduleMNREFetch() {
    mnreTask = node_cron_1.default.schedule(constants_1.API_REFRESH_INTERVALS.MNRE, async () => {
        logger_1.default.info('Scheduler: running MNRE fetch...');
        try {
            await mnreService.fetchCapacityData();
            await mnreService.fetchGenerationData();
        }
        catch (error) {
            logger_1.default.error('Scheduler: MNRE fetch failed:', error);
        }
    });
    logger_1.default.info(`MNRE scheduler started (${constants_1.API_REFRESH_INTERVALS.MNRE}).`);
}
function scheduleCEAFetch() {
    ceaTask = node_cron_1.default.schedule(constants_1.API_REFRESH_INTERVALS.CEA, async () => {
        logger_1.default.info('Scheduler: running CEA fetch...');
        try {
            await ceaService.fetchGenerationData();
        }
        catch (error) {
            logger_1.default.error('Scheduler: CEA fetch failed:', error);
        }
    });
    logger_1.default.info(`CEA scheduler started (${constants_1.API_REFRESH_INTERVALS.CEA}).`);
}
function scheduleMinistryFetch() {
    ministryTask = node_cron_1.default.schedule(constants_1.API_REFRESH_INTERVALS.MINISTRY_OF_POWER, async () => {
        logger_1.default.info('Scheduler: running Ministry of Power fetch...');
        try {
            await ministryService.fetchStatewiseData();
            await ministryService.fetchEnvironmentalMetrics();
        }
        catch (error) {
            logger_1.default.error('Scheduler: Ministry of Power fetch failed:', error);
        }
    });
    logger_1.default.info(`Ministry of Power scheduler started (${constants_1.API_REFRESH_INTERVALS.MINISTRY_OF_POWER}).`);
}
function initializeSchedulers() {
    scheduleMNREFetch();
    scheduleCEAFetch();
    scheduleMinistryFetch();
    logger_1.default.info('All schedulers initialized.');
}
async function runInitialFetch() {
    logger_1.default.info('Running initial data fetch from all sources...');
    try {
        await Promise.all([
            mnreService.fetchCapacityData(),
            mnreService.fetchGenerationData(),
        ]);
        await ceaService.fetchGenerationData();
        await ministryService.fetchStatewiseData();
        logger_1.default.info('Initial data fetch complete.');
    }
    catch (error) {
        logger_1.default.error('Initial data fetch encountered errors:', error);
    }
}
function stopAllSchedulers() {
    mnreTask?.stop();
    ceaTask?.stop();
    ministryTask?.stop();
    logger_1.default.info('All schedulers stopped.');
}
//# sourceMappingURL=schedulerService.js.map