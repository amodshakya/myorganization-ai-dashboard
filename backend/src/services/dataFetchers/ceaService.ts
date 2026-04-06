import { v4 as uuidv4 } from 'uuid';
import { RenewableGeneration, HistoricalData, DataSource } from '../../models';
import { GenerationData, GridStats } from '../../types';
import { randomBetween, solarFactor } from '../../utils/helpers';
import logger from '../../logger';

const DATA_SOURCE = 'cea';

// CEA-grade generation capacities (MW) – India's total installed renewable capacity ~2024
const BASE_CAPACITY = {
  solar: 73000,
  wind: 44700,
  hydro: 46900,
  biomass: 10600,
  geothermal: 50,
};

export async function fetchGenerationData(): Promise<GenerationData[]> {
  const now = new Date();
  const sf = solarFactor();

  const generation: Record<string, number> = {
    solar: parseFloat((BASE_CAPACITY.solar * sf * randomBetween(0.6, 0.95)).toFixed(2)),
    wind: parseFloat((BASE_CAPACITY.wind * randomBetween(0.35, 0.75)).toFixed(2)),
    hydro: parseFloat((BASE_CAPACITY.hydro * randomBetween(0.55, 0.80)).toFixed(2)),
    biomass: parseFloat((BASE_CAPACITY.biomass * randomBetween(0.55, 0.75)).toFixed(2)),
    geothermal: parseFloat((BASE_CAPACITY.geothermal * randomBetween(0.60, 0.80)).toFixed(2)),
  };

  const records: GenerationData[] = (
    Object.entries(generation) as Array<[keyof typeof generation, number]>
  ).map(([source, value_mw]) => ({
    id: uuidv4(),
    source: source as GenerationData['source'],
    value_mw,
    timestamp: now,
    data_source: DATA_SOURCE,
  }));

  try {
    await RenewableGeneration.bulkCreate(
      records.map((r) => ({ ...r })),
      { ignoreDuplicates: true }
    );

    // Write aggregated row to historical_data
    const total_mw = records.reduce((s, r) => s + r.value_mw, 0);
    const totalInstalledMW = Object.values(BASE_CAPACITY).reduce((a, b) => a + b, 0);
    const renewable_percentage = parseFloat(((total_mw / totalInstalledMW) * 100).toFixed(2));

    await HistoricalData.create({
      id: uuidv4(),
      timestamp: now,
      solar_mw: generation['solar'] ?? 0,
      wind_mw: generation['wind'] ?? 0,
      hydro_mw: generation['hydro'] ?? 0,
      biomass_mw: generation['biomass'] ?? 0,
      geothermal_mw: generation['geothermal'] ?? 0,
      total_mw: parseFloat(total_mw.toFixed(2)),
      renewable_percentage,
      data_source: DATA_SOURCE,
    });

    await updateDataSourceStatus(records.length);
    logger.info(`CEA: stored ${records.length} generation records (total ${total_mw.toFixed(0)} MW).`);
  } catch (error) {
    logger.error('CEA fetchGenerationData DB error:', error);
    await setDataSourceError(String(error));
  }

  return records;
}

export function fetchGridStats(): GridStats {
  return {
    frequency_hz: randomBetween(49.9, 50.1),
    peak_load_gw: randomBetween(180, 210),
    grid_availability_percent: randomBetween(99.0, 99.9),
    timestamp: new Date(),
  };
}

async function updateDataSourceStatus(count: number): Promise<void> {
  const now = new Date();
  const nextUpdate = new Date(now.getTime() + 15 * 60 * 1000); // +15 min
  const [instance, created] = await DataSource.findOrCreate({
    where: { name: DATA_SOURCE },
    defaults: {
      id: uuidv4(),
      name: DATA_SOURCE,
      last_updated: now,
      status: 'active',
      next_update: nextUpdate,
      records_count: count,
    },
  });
  if (!created) {
    await instance.update({
      last_updated: now,
      status: 'active',
      next_update: nextUpdate,
      records_count: count,
      error_message: undefined,
    });
  }
}

async function setDataSourceError(message: string): Promise<void> {
  const [instance, created] = await DataSource.findOrCreate({
    where: { name: DATA_SOURCE },
    defaults: {
      id: uuidv4(),
      name: DATA_SOURCE,
      last_updated: new Date(),
      status: 'error',
      next_update: null,
      records_count: 0,
      error_message: message,
    },
  });
  if (!created) {
    await instance.update({
      last_updated: new Date(),
      status: 'error',
      next_update: null,
      records_count: 0,
      error_message: message,
    });
  }
}
