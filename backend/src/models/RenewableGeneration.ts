import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RenewableGenerationAttributes {
  id: string;
  source: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  value_mw: number;
  timestamp: Date;
  state?: string;
  data_source: string;
  raw_data?: object;
}

type RenewableGenerationCreationAttributes = Optional<RenewableGenerationAttributes, 'id'>;

class RenewableGeneration
  extends Model<RenewableGenerationAttributes, RenewableGenerationCreationAttributes>
  implements RenewableGenerationAttributes
{
  public id!: string;
  public source!: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  public value_mw!: number;
  public timestamp!: Date;
  public state?: string;
  public data_source!: string;
  public raw_data?: object;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RenewableGeneration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    source: {
      type: DataTypes.ENUM('solar', 'wind', 'hydro', 'biomass', 'geothermal'),
      allowNull: false,
    },
    value_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raw_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'renewable_energy_generation',
    underscored: true,
    indexes: [
      { fields: ['source'] },
      { fields: ['timestamp'] },
      { fields: ['state'] },
      { fields: ['data_source'] },
    ],
  }
);

export default RenewableGeneration;
