import { v4 as uuidv4 } from 'uuid';
import { RenewableCapacity, RenewableGeneration, DataSource } from '../../models';
import { CapacityData, GenerationData } from '../../types';
import { randomBetween } from '../../utils/helpers';
import logger from '../../logger';

const CURRENT_YEAR = new Date().getFullYear();
const DATA_SOURCE = 'mnre';

// Realistic MNRE capacity data (MW) by state and source, based on India's installed capacity reports
const SOLAR_CAPACITY: Record<string, number> = {
  'Rajasthan': 18500,
  'Gujarat': 10000,
  'Karnataka': 8500,
  'Tamil Nadu': 6000,
  'Andhra Pradesh': 5500,
  'Telangana': 4500,
  'Madhya Pradesh': 4000,
  'Maharashtra': 3500,
  'Uttar Pradesh': 3000,
  'Punjab': 1200,
  'Haryana': 900,
  'Kerala': 800,
  'Odisha': 700,
  'West Bengal': 600,
  'Bihar': 500,
  'Chhattisgarh': 450,
  'Himachal Pradesh': 300,
  'Uttarakhand': 250,
  'Jharkhand': 200,
  'Assam': 150,
  'Delhi': 200,
  'Jammu & Kashmir': 180,
  'Ladakh': 100,
  'Goa': 80,
  'Manipur': 40,
  'Meghalaya': 30,
  'Mizoram': 25,
  'Nagaland': 20,
  'Tripura': 20,
  'Sikkim': 15,
  'Arunachal Pradesh': 10,
};

const WIND_CAPACITY: Record<string, number> = {
  'Tamil Nadu': 10600,
  'Gujarat': 8500,
  'Rajasthan': 5500,
  'Karnataka': 5000,
  'Maharashtra': 4800,
  'Andhra Pradesh': 4200,
  'Telangana': 1500,
  'Madhya Pradesh': 600,
  'Kerala': 300,
  'Odisha': 200,
  'West Bengal': 100,
  'Himachal Pradesh': 50,
  'Uttarakhand': 30,
  'Punjab': 20,
  'Haryana': 10,
};

const BIOMASS_CAPACITY: Record<string, number> = {
  'Uttar Pradesh': 1500,
  'Punjab': 900,
  'Maharashtra': 700,
  'Andhra Pradesh': 600,
  'Karnataka': 550,
  'Tamil Nadu': 500,
  'Madhya Pradesh': 450,
  'Gujarat': 400,
  'Rajasthan': 350,
  'Haryana': 300,
  'Bihar': 250,
  'West Bengal': 200,
  'Chhattisgarh': 150,
  'Odisha': 120,
  'Telangana': 100,
};

const SMALL_HYDRO_CAPACITY: Record<string, number> = {
  'Himachal Pradesh': 2500,
  'Uttarakhand': 1800,
  'Karnataka': 1400,
  'Jammu & Kashmir': 900,
  'Arunachal Pradesh': 800,
  'Kerala': 700,
  'Maharashtra': 600,
  'Sikkim': 450,
  'Manipur': 300,
  'Meghalaya': 250,
  'Ladakh': 200,
  'Assam': 150,
  'Nagaland': 100,
  'Mizoram': 80,
  'Tripura': 60,
};

function buildCapacityRecords(
  map: Record<string, number>,
  sourceType: 'solar' | 'wind' | 'hydro' | 'biomass' | 'geothermal'
): CapacityData[] {
  return Object.entries(map).map(([state, capacity_mw]) => ({
    id: uuidv4(),
    state,
    source_type: sourceType,
    capacity_mw,
    year: CURRENT_YEAR,
    data_source: DATA_SOURCE,
  }));
}

export async function fetchCapacityData(): Promise<CapacityData[]> {
  const records: CapacityData[] = [
    ...buildCapacityRecords(SOLAR_CAPACITY, 'solar'),
    ...buildCapacityRecords(WIND_CAPACITY, 'wind'),
    ...buildCapacityRecords(BIOMASS_CAPACITY, 'biomass'),
    ...buildCapacityRecords(SMALL_HYDRO_CAPACITY, 'hydro'),
  ];

  try {
    // Upsert using bulkCreate – destroy existing MNRE records first for idempotency
    await RenewableCapacity.destroy({ where: { data_source: DATA_SOURCE } });
    await RenewableCapacity.bulkCreate(
      records.map((r) => ({ ...r })),
      { ignoreDuplicates: true }
    );

    await updateDataSourceStatus(records.length);
    logger.info(`MNRE: stored ${records.length} capacity records.`);
  } catch (error) {
    logger.error('MNRE fetchCapacityData DB error:', error);
    await setDataSourceError(String(error));
  }

  return records;
}

export async function fetchGenerationData(): Promise<GenerationData[]> {
  const now = new Date();
  const records: GenerationData[] = [];

  const capacityMaps: Array<[Record<string, number>, 'solar' | 'wind' | 'hydro' | 'biomass']> = [
    [SOLAR_CAPACITY, 'solar'],
    [WIND_CAPACITY, 'wind'],
    [BIOMASS_CAPACITY, 'biomass'],
    [SMALL_HYDRO_CAPACITY, 'hydro'],
  ];

  for (const [map, source] of capacityMaps) {
    for (const [state, capacity] of Object.entries(map)) {
      const factor = randomBetween(0.2, 0.8);
      records.push({
        id: uuidv4(),
        source,
        value_mw: parseFloat((capacity * factor).toFixed(2)),
        timestamp: now,
        state,
        data_source: DATA_SOURCE,
      });
    }
  }

  try {
    await RenewableGeneration.bulkCreate(
      records.map((r) => ({ ...r })),
      { ignoreDuplicates: true }
    );
    logger.info(`MNRE: stored ${records.length} generation records.`);
  } catch (error) {
    logger.error('MNRE fetchGenerationData DB error:', error);
  }

  return records;
}

async function updateDataSourceStatus(count: number): Promise<void> {
  const now = new Date();
  const nextUpdate = new Date(now.getTime() + 60 * 60 * 1000); // +1h
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
