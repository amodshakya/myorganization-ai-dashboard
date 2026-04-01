import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DataSourceAttributes {
  id: string;
  name: string;
  last_updated: Date | null;
  status: 'active' | 'inactive' | 'error';
  next_update: Date | null;
  records_count: number;
  error_message?: string;
}

type DataSourceCreationAttributes = Optional<DataSourceAttributes, 'id'>;

class DataSource
  extends Model<DataSourceAttributes, DataSourceCreationAttributes>
  implements DataSourceAttributes
{
  public id!: string;
  public name!: string;
  public last_updated!: Date | null;
  public status!: 'active' | 'inactive' | 'error';
  public next_update!: Date | null;
  public records_count!: number;
  public error_message?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DataSource.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'error'),
      allowNull: false,
      defaultValue: 'inactive',
    },
    next_update: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    records_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'data_sources',
    underscored: true,
    indexes: [{ fields: ['name'] }, { fields: ['status'] }],
  }
);

export default DataSource;
