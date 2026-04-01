import { Model, Optional } from 'sequelize';
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
declare class RenewableGeneration extends Model<RenewableGenerationAttributes, RenewableGenerationCreationAttributes> implements RenewableGenerationAttributes {
    id: string;
    source: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
    value_mw: number;
    timestamp: Date;
    state?: string;
    data_source: string;
    raw_data?: object;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default RenewableGeneration;
//# sourceMappingURL=RenewableGeneration.d.ts.map