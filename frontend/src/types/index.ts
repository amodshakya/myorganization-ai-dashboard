export type EnergySource = 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal';

export interface GenerationData {
  id?: string;
  source: EnergySource;
  value_mw: number;
  timestamp: string;
  state?: string;
  data_source: string;
}

export interface CapacityData {
  id?: string;
  state: string;
  source_type: EnergySource;
  capacity_mw: number;
  year: number;
  data_source: string;
  percentage_of_total?: number;
}

export interface HistoricalDataPoint {
  id?: string;
  timestamp: string;
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
  last_updated: string;
  status: 'active' | 'inactive' | 'error';
  next_update: string;
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

export interface CarbonMetrics {
  total_co2_avoided_tons: number;
  equivalent_trees_planted: number;
  equivalent_cars_off_road: number;
  monthly_average_tons: number;
}

export interface CapacityByType {
  source_type: EnergySource;
  total_capacity_mw: number;
  percentage: number;
  states_count: number;
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

export interface FilterState {
  state: string;
  energyType: EnergySource | 'all';
  dateRange: '24h' | '7d' | '30d';
  searchQuery: string;
}

export type Theme = 'light' | 'dark';
