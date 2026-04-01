import { sequelize } from '../config/database';
import logger from '../logger';
import RenewableGeneration from './RenewableGeneration';
import RenewableCapacity from './RenewableCapacity';
import HistoricalData from './HistoricalData';
import DataSource from './DataSource';

export { RenewableGeneration, RenewableCapacity, HistoricalData, DataSource, sequelize };

export async function syncModels(force = false): Promise<void> {
  try {
    await sequelize.sync({ force, alter: !force });
    logger.info('All models synchronized with database.');
  } catch (error) {
    logger.error('Failed to sync models:', error);
    throw error;
  }
}
