import { Model, Optional } from 'sequelize';
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
declare class HistoricalData extends Model<HistoricalDataAttributes, HistoricalDataCreationAttributes> implements HistoricalDataAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default HistoricalData;
//# sourceMappingURL=HistoricalData.d.ts.map