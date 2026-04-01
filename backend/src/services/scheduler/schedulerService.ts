import cron from 'node-cron';
import * as mnreService from '../dataFetchers/mnreService';
import * as ceaService from '../dataFetchers/ceaService';
import * as ministryService from '../dataFetchers/ministryOfPowerService';
import { API_REFRESH_INTERVALS } from '../../utils/constants';
import logger from '../../logger';

let mnreTask: cron.ScheduledTask | null = null;
let ceaTask: cron.ScheduledTask | null = null;
let ministryTask: cron.ScheduledTask | null = null;

export function scheduleMNREFetch(): void {
  mnreTask = cron.schedule(API_REFRESH_INTERVALS.MNRE, async () => {
    logger.info('Scheduler: running MNRE fetch...');
    try {
      await mnreService.fetchCapacityData();
      await mnreService.fetchGenerationData();
    } catch (error) {
      logger.error('Scheduler: MNRE fetch failed:', error);
    }
  });
  logger.info(`MNRE scheduler started (${API_REFRESH_INTERVALS.MNRE}).`);
}

export function scheduleCEAFetch(): void {
  ceaTask = cron.schedule(API_REFRESH_INTERVALS.CEA, async () => {
    logger.info('Scheduler: running CEA fetch...');
    try {
      await ceaService.fetchGenerationData();
    } catch (error) {
      logger.error('Scheduler: CEA fetch failed:', error);
    }
  });
  logger.info(`CEA scheduler started (${API_REFRESH_INTERVALS.CEA}).`);
}

export function scheduleMinistryFetch(): void {
  ministryTask = cron.schedule(API_REFRESH_INTERVALS.MINISTRY_OF_POWER, async () => {
    logger.info('Scheduler: running Ministry of Power fetch...');
    try {
      await ministryService.fetchStatewiseData();
      await ministryService.fetchEnvironmentalMetrics();
    } catch (error) {
      logger.error('Scheduler: Ministry of Power fetch failed:', error);
    }
  });
  logger.info(`Ministry of Power scheduler started (${API_REFRESH_INTERVALS.MINISTRY_OF_POWER}).`);
}

export function initializeSchedulers(): void {
  scheduleMNREFetch();
  scheduleCEAFetch();
  scheduleMinistryFetch();
  logger.info('All schedulers initialized.');
}

export async function runInitialFetch(): Promise<void> {
  logger.info('Running initial data fetch from all sources...');
  try {
    await Promise.all([
      mnreService.fetchCapacityData(),
      mnreService.fetchGenerationData(),
    ]);
    await ceaService.fetchGenerationData();
    await ministryService.fetchStatewiseData();
    logger.info('Initial data fetch complete.');
  } catch (error) {
    logger.error('Initial data fetch encountered errors:', error);
  }
}

export function stopAllSchedulers(): void {
  mnreTask?.stop();
  ceaTask?.stop();
  ministryTask?.stop();
  logger.info('All schedulers stopped.');
}
