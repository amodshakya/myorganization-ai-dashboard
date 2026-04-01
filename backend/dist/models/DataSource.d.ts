import { Model, Optional } from 'sequelize';
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
declare class DataSource extends Model<DataSourceAttributes, DataSourceCreationAttributes> implements DataSourceAttributes {
    id: string;
    name: string;
    last_updated: Date | null;
    status: 'active' | 'inactive' | 'error';
    next_update: Date | null;
    records_count: number;
    error_message?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default DataSource;
//# sourceMappingURL=DataSource.d.ts.map