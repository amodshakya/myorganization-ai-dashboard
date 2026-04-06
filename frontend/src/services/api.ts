import axios from 'axios';
import {
  DashboardSummary,
  GenerationData,
  HistoricalDataPoint,
  StateCapacity,
  CapacityByType,
  CarbonMetrics,
  DataSourceStatus,
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL ?? '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.error ??
      error?.message ??
      'An unexpected error occurred';
    console.error(`[API Error] ${msg}`);
    return Promise.reject(new Error(msg));
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(response: { data: { data?: T; success?: boolean } }): T {
  const payload = response.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as unknown as T;
}

// ── Mock fallback data ────────────────────────────────────────────────────────

const MOCK_SUMMARY: DashboardSummary = {
  total_capacity_gw: 179.3,
  current_generation_gw: 98.6,
  renewable_percentage: 42.5,
  co2_avoided_tons: 980000,
  peak_load_gw: 220.4,
  grid_frequency: 49.97,
  data_sources: [
    {
      name: 'MNRE',
      last_updated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'active',
      next_update: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      records_count: 1248,
    },
    {
      name: 'CEA',
      last_updated: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'active',
      next_update: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      records_count: 876,
    },
    {
      name: 'Ministry of Power',
      last_updated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'active',
      next_update: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
      records_count: 542,
    },
  ],
};

const MOCK_GENERATION: GenerationData[] = [
  { source: 'solar', value_mw: 68500, timestamp: new Date().toISOString(), data_source: 'MNRE' },
  { source: 'wind', value_mw: 44700, timestamp: new Date().toISOString(), data_source: 'MNRE' },
  { source: 'hydro', value_mw: 46900, timestamp: new Date().toISOString(), data_source: 'CEA' },
  { source: 'biomass', value_mw: 10600, timestamp: new Date().toISOString(), data_source: 'MNRE' },
  { source: 'geothermal', value_mw: 600, timestamp: new Date().toISOString(), data_source: 'MNRE' },
];

function generateHistory(points: number): HistoricalDataPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const ts = new Date(now - (points - i) * 3600 * 1000).toISOString();
    const solar = 55000 + Math.random() * 20000;
    const wind = 35000 + Math.random() * 15000;
    const hydro = 42000 + Math.random() * 10000;
    const biomass = 9000 + Math.random() * 3000;
    const geothermal = 500 + Math.random() * 200;
    const total = solar + wind + hydro + biomass + geothermal;
    return {
      timestamp: ts,
      solar_mw: Math.round(solar),
      wind_mw: Math.round(wind),
      hydro_mw: Math.round(hydro),
      biomass_mw: Math.round(biomass),
      geothermal_mw: Math.round(geothermal),
      total_mw: Math.round(total),
      renewable_percentage: +(( total / (total + 130000)) * 100).toFixed(1),
      data_source: 'mock',
    };
  });
}

const MOCK_STATE_CAPACITY: StateCapacity[] = [
  { state: 'Rajasthan', solar_mw: 18700, wind_mw: 4200, hydro_mw: 190, biomass_mw: 440, geothermal_mw: 0, total_mw: 23530 },
  { state: 'Gujarat', solar_mw: 9800, wind_mw: 8500, hydro_mw: 890, biomass_mw: 310, geothermal_mw: 0, total_mw: 19500 },
  { state: 'Tamil Nadu', solar_mw: 7600, wind_mw: 10200, hydro_mw: 2100, biomass_mw: 650, geothermal_mw: 0, total_mw: 20550 },
  { state: 'Karnataka', solar_mw: 8900, wind_mw: 5500, hydro_mw: 3800, biomass_mw: 420, geothermal_mw: 0, total_mw: 18620 },
  { state: 'Andhra Pradesh', solar_mw: 8100, wind_mw: 4200, hydro_mw: 1900, biomass_mw: 730, geothermal_mw: 0, total_mw: 14930 },
  { state: 'Maharashtra', solar_mw: 5200, wind_mw: 5600, hydro_mw: 3400, biomass_mw: 820, geothermal_mw: 0, total_mw: 15020 },
  { state: 'Madhya Pradesh', solar_mw: 6500, wind_mw: 2800, hydro_mw: 2100, biomass_mw: 540, geothermal_mw: 0, total_mw: 11940 },
  { state: 'Telangana', solar_mw: 5900, wind_mw: 1900, hydro_mw: 1400, biomass_mw: 290, geothermal_mw: 0, total_mw: 9490 },
  { state: 'Uttar Pradesh', solar_mw: 2900, wind_mw: 460, hydro_mw: 1200, biomass_mw: 1100, geothermal_mw: 0, total_mw: 5660 },
  { state: 'Himachal Pradesh', solar_mw: 380, wind_mw: 120, hydro_mw: 9800, biomass_mw: 60, geothermal_mw: 0, total_mw: 10360 },
  { state: 'Punjab', solar_mw: 1200, wind_mw: 80, hydro_mw: 1500, biomass_mw: 760, geothermal_mw: 0, total_mw: 3540 },
  { state: 'Haryana', solar_mw: 1400, wind_mw: 280, hydro_mw: 150, biomass_mw: 410, geothermal_mw: 0, total_mw: 2240 },
  { state: 'Odisha', solar_mw: 1800, wind_mw: 200, hydro_mw: 2900, biomass_mw: 380, geothermal_mw: 0, total_mw: 5280 },
  { state: 'West Bengal', solar_mw: 900, wind_mw: 70, hydro_mw: 710, biomass_mw: 450, geothermal_mw: 0, total_mw: 2130 },
  { state: 'Kerala', solar_mw: 1100, wind_mw: 400, hydro_mw: 1940, biomass_mw: 140, geothermal_mw: 0, total_mw: 3580 },
];

const MOCK_BY_TYPE: CapacityByType[] = [
  { source_type: 'solar', total_capacity_mw: 73314, percentage: 40.9, states_count: 28 },
  { source_type: 'wind', total_capacity_mw: 44736, percentage: 24.9, states_count: 18 },
  { source_type: 'hydro', total_capacity_mw: 46928, percentage: 26.2, states_count: 25 },
  { source_type: 'biomass', total_capacity_mw: 10503, percentage: 5.9, states_count: 22 },
  { source_type: 'geothermal', total_capacity_mw: 3700, percentage: 2.1, states_count: 5 },
];

const MOCK_CARBON: CarbonMetrics = {
  total_co2_avoided_tons: 980000,
  equivalent_trees_planted: 4410000,
  equivalent_cars_off_road: 213000,
  monthly_average_tons: 81667,
};

// ── API functions ─────────────────────────────────────────────────────────────

async function safeGet<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await apiClient.get(url);
    return unwrap<T>(res);
  } catch {
    return fallback;
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return safeGet<DashboardSummary>('/dashboard/summary', MOCK_SUMMARY);
}

export async function getCurrentGeneration(): Promise<GenerationData[]> {
  return safeGet<GenerationData[]>('/generation/current', MOCK_GENERATION);
}

export async function getGenerationHistory(period: string): Promise<HistoricalDataPoint[]> {
  const points = period === '30d' ? 30 * 24 : period === '7d' ? 7 * 24 : 24;
  return safeGet<HistoricalDataPoint[]>(
    `/generation/history?period=${period}`,
    generateHistory(points)
  );
}

export async function getCapacityByState(): Promise<StateCapacity[]> {
  return safeGet<StateCapacity[]>('/capacity/by-state', MOCK_STATE_CAPACITY);
}

export async function getCapacityByType(): Promise<CapacityByType[]> {
  return safeGet<CapacityByType[]>('/capacity/by-type', MOCK_BY_TYPE);
}

export async function getCarbonMetrics(): Promise<CarbonMetrics> {
  return safeGet<CarbonMetrics>('/environment/carbon-avoided', MOCK_CARBON);
}

export async function getDataSourceStatus(): Promise<DataSourceStatus[]> {
  const summary = await getDashboardSummary();
  return summary.data_sources ?? [];
}

export async function exportCSV(): Promise<Blob> {
  try {
    const response = await apiClient.get('/export/report', { responseType: 'blob' });
    return response.data as Blob;
  } catch {
    // Return a minimal CSV as fallback
    const csv = 'source,value_mw,timestamp\nsolar,68500,' + new Date().toISOString();
    return new Blob([csv], { type: 'text/csv' });
  }
}
