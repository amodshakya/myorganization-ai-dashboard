import { Request, Response, NextFunction } from 'express';
import { fn, col, literal } from 'sequelize';
import { RenewableCapacity, RenewableGeneration, DataSource } from '../../models';
import { DashboardSummary, ApiResponse } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { fetchGridStats } from '../../services/dataFetchers/ceaService';
import { mwToGw } from '../../utils/helpers';
import { CACHE_KEYS, CACHE_TTL, CO2_FACTOR } from '../../utils/constants';
import logger from '../../logger';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<DashboardSummary>(CACHE_KEYS.DASHBOARD_SUMMARY);
    if (cached) {
      const body: ApiResponse<DashboardSummary> = {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
      res.json(body);
      return;
    }

    // Total installed capacity (GW)
    const capacityResult = await RenewableCapacity.findAll({
      attributes: [[fn('SUM', col('capacity_mw')), 'total']],
      raw: true,
    }) as unknown as Array<{ total: string }>;
    const totalCapacityMW = parseFloat(capacityResult[0]?.total ?? '0');

    // Latest generation per source
    const genRows = await RenewableGeneration.findAll({
      attributes: [
        'source',
        [fn('MAX', col('timestamp')), 'latest_ts'],
        [fn('AVG', col('value_mw')), 'avg_mw'],
      ],
      group: ['source'],
      raw: true,
    }) as unknown as Array<{ source: string; avg_mw: string }>;

    const currentGenerationMW = genRows.reduce((s, r) => s + parseFloat(r.avg_mw ?? '0'), 0);
    const renewablePercent =
      totalCapacityMW > 0
        ? parseFloat(((currentGenerationMW / totalCapacityMW) * 100).toFixed(2))
        : 0;

    // CO2 avoided estimate based on generation (MWh proxy)
    const co2AvoidedTons = parseFloat((currentGenerationMW * CO2_FACTOR).toFixed(2));

    const gridStats = fetchGridStats();

    const dataSources = await DataSource.findAll({ raw: true });
    const dataSourceStatuses = dataSources.map((ds) => ({
      name: ds.name,
      last_updated: ds.last_updated,
      status: ds.status,
      next_update: ds.next_update,
      records_count: ds.records_count,
    }));

    const summary: DashboardSummary = {
      total_capacity_gw: mwToGw(totalCapacityMW),
      current_generation_gw: mwToGw(currentGenerationMW),
      renewable_percentage: renewablePercent,
      co2_avoided_tons: co2AvoidedTons,
      peak_load_gw: gridStats.peak_load_gw,
      grid_frequency: gridStats.frequency_hz,
      data_sources: dataSourceStatuses,
    };

    await redisService.set(CACHE_KEYS.DASHBOARD_SUMMARY, summary, CACHE_TTL.DASHBOARD_SUMMARY);

    const body: ApiResponse<DashboardSummary> = {
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    };
    res.json(body);
  } catch (error) {
    logger.error('dashboardController.getSummary error:', error);
    next(error);
  }
}
