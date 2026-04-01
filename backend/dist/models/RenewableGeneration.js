"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class RenewableGeneration extends sequelize_1.Model {
}
RenewableGeneration.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    source: {
        type: sequelize_1.DataTypes.ENUM('solar', 'wind', 'hydro', 'biomass', 'geothermal'),
        allowNull: false,
    },
    value_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    data_source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    raw_data: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'renewable_energy_generation',
    underscored: true,
    indexes: [
        { fields: ['source'] },
        { fields: ['timestamp'] },
        { fields: ['state'] },
        { fields: ['data_source'] },
    ],
});
exports.default = RenewableGeneration;
//# sourceMappingURL=RenewableGeneration.js.map