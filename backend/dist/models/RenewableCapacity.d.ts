import { Model, Optional } from 'sequelize';
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
declare class RenewableCapacity extends Model<RenewableCapacityAttributes, RenewableCapacityCreationAttributes> implements RenewableCapacityAttributes {
    id: string;
    state: string;
    source_type: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
    capacity_mw: number;
    year: number;
    data_source: string;
    percentage_of_total?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default RenewableCapacity;
//# sourceMappingURL=RenewableCapacity.d.ts.map