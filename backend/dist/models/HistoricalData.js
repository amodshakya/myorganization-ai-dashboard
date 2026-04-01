"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class HistoricalData extends sequelize_1.Model {
}
HistoricalData.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    solar_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    wind_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    hydro_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    biomass_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    geothermal_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    total_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    renewable_percentage: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    data_source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'historical_data',
    underscored: true,
    indexes: [{ fields: ['timestamp'] }, { fields: ['data_source'] }],
});
exports.default = HistoricalData;
//# sourceMappingURL=HistoricalData.js.map