"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class DataSource extends sequelize_1.Model {
}
DataSource.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    last_updated: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'error'),
        allowNull: false,
        defaultValue: 'inactive',
    },
    next_update: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    records_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    error_message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'data_sources',
    underscored: true,
    indexes: [{ fields: ['name'] }, { fields: ['status'] }],
});
exports.default = DataSource;
//# sourceMappingURL=DataSource.js.map