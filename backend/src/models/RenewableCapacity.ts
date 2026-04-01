import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RenewableCapacityAttributes {
  id: string;
  state: string;
  source_type: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  capacity_mw: number;
  year: number;
  data_source: string;
  percentage_of_total?: number;
}

type RenewableCapacityCreationAttributes = Optional<RenewableCapacityAttributes, 'id'>;

class RenewableCapacity
  extends Model<RenewableCapacityAttributes, RenewableCapacityCreationAttributes>
  implements RenewableCapacityAttributes
{
  public id!: string;
  public state!: string;
  public source_type!: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
  public capacity_mw!: number;
  public year!: number;
  public data_source!: string;
  public percentage_of_total?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RenewableCapacity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source_type: {
      type: DataTypes.ENUM('solar', 'wind', 'hydro', 'biomass', 'geothermal'),
      allowNull: false,
    },
    capacity_mw: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data_source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage_of_total: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'renewable_capacity',
    underscored: true,
    indexes: [
      { fields: ['state'] },
      { fields: ['source_type'] },
      { fields: ['year'] },
    ],
  }
);

export default RenewableCapacity;
