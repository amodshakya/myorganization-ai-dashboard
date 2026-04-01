import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface HistoricalDataAttributes {
  id: string;
  timestamp: Date;
  solar_mw: number;
  wind_mw: number;
  hydro_mw: number;
  biomass_mw: number;
  geothermal_mw: number;
  total_mw: number;
  renewable_percentage: number;
  data_source: string;
}

type HistoricalDataCreationAttributes = Optional<HistoricalDataAttributes, 'id'>;

class HistoricalData
  extends Model<HistoricalDataAttributes, HistoricalDataCreationAttributes>
  implements HistoricalDataAttributes
{
  public id!: string;
  public timestamp!: Date;
  public solar_mw!: number;
  public wind_mw!: number;
  public hydro_mw!: number;
  public biomass_mw!: number;
  public geothermal_mw!: number;
  public total_mw!: number;
  public renewable_percentage!: number;
  public data_source!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HistoricalData.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    solar_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    wind_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    hydro_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    biomass_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    geothermal_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    total_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    renewable_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    data_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'historical_data',
    underscored: true,
    indexes: [{ fields: ['timestamp'] }, { fields: ['data_source'] }],
  }
);

export default HistoricalData;
