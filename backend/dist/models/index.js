"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.DataSource = exports.HistoricalData = exports.RenewableCapacity = exports.RenewableGeneration = void 0;
exports.syncModels = syncModels;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const logger_1 = __importDefault(require("../logger"));
const RenewableGeneration_1 = __importDefault(require("./RenewableGeneration"));
exports.RenewableGeneration = RenewableGeneration_1.default;
const RenewableCapacity_1 = __importDefault(require("./RenewableCapacity"));
exports.RenewableCapacity = RenewableCapacity_1.default;
const HistoricalData_1 = __importDefault(require("./HistoricalData"));
exports.HistoricalData = HistoricalData_1.default;
const DataSource_1 = __importDefault(require("./DataSource"));
exports.DataSource = DataSource_1.default;
async function syncModels(force = false) {
    try {
        await database_1.sequelize.sync({ force, alter: !force });
        logger_1.default.info('All models synchronized with database.');
    }
    catch (error) {
        logger_1.default.error('Failed to sync models:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map