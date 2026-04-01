"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sequelize = exports.sequelize = void 0;
exports.connectDatabase = connectDatabase;
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const logger_1 = __importDefault(require("../logger"));
const { DB_HOST = 'localhost', DB_PORT = '5432', DB_NAME = 'renewable_energy', DB_USER = 'postgres', DB_PASSWORD = 'postgres', } = process.env;
exports.sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'postgres',
    logging: (msg) => logger_1.default.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        underscored: true,
        timestamps: true,
    },
});
async function connectDatabase() {
    try {
        await exports.sequelize.authenticate();
        logger_1.default.info('Database connection established successfully.');
    }
    catch (error) {
        logger_1.default.error('Unable to connect to the database:', error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map