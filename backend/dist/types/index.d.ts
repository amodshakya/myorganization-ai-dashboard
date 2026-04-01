export type EnergySource = 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';
export interface GenerationData {
    id: string;
    source: EnergySource;
    value_mw: number;
    timestamp: Date;
    state?: string;
    data_source: string;
}
export interface CapacityData {
    id: string;
    state: string;
    source_type: EnergySource;
    capacity_mw: number;
    year: number;
    data_source: string;
    percentage_of_total?: number;
}
export interface HistoricalData {
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
export interface DataSourceStatus {
    name: string;
    last_updated: Date | null;
    status: 'active' | 'inactive' | 'error';
    next_update: Date | null;
    records_count: number;
}
export interface DashboardSummary {
    total_capacity_gw: number;
    current_generation_gw: number;
    renewable_percentage: number;
    co2_avoided_tons: number;
    peak_load_gw: number;
    grid_frequency: number;
    data_sources: DataSourceStatus[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    pagination?: PaginationMeta;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface FilterParams {
    state?: string;
    source?: EnergySource;
    startDate?: string;
    endDate?: string;
    year?: number;
}
export interface GridStats {
    frequency_hz: number;
    peak_load_gw: number;
    grid_availability_percent: number;
    timestamp: Date;
}
export interface EnvironmentalMetrics {
    co2_avoided_tons: number;
    trees_equivalent: number;
    cars_off_road_equivalent: number;
    period_mwh: number;
}
export interface StateCapacity {
    state: string;
    solar_mw: number;
    wind_mw: number;
    hydro_mw: number;
    biomass_mw: number;
    geothermal_mw: number;
    total_mw: number;
}
//# sourceMappingURL=index.d.ts.map