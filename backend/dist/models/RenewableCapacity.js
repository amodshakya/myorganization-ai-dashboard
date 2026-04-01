"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class RenewableCapacity extends sequelize_1.Model {
}
RenewableCapacity.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    source_type: {
        type: sequelize_1.DataTypes.ENUM('solar', 'wind', 'hydro', 'biomass', 'geothermal'),
        allowNull: false,
    },
    capacity_mw: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    data_source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    percentage_of_total: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'renewable_capacity',
    underscored: true,
    indexes: [
        { fields: ['state'] },
        { fields: ['source_type'] },
        { fields: ['year'] },
    ],
});
exports.default = RenewableCapacity;
//# sourceMappingURL=RenewableCapacity.js.map