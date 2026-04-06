import { Request, Response, NextFunction } from 'express';
import { fetchEnvironmentalMetrics } from '../../services/dataFetchers/ministryOfPowerService';
import { ApiResponse } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/constants';
import logger from '../../logger';

/** Shape expected by the frontend CarbonMetrics type */
interface CarbonMetricsResponse {
  total_co2_avoided_tons: number;
  equivalent_trees_planted: number;
  equivalent_cars_off_road: number;
  monthly_average_tons: number;
}

const CARBON_METRICS_CACHE_KEY = CACHE_KEYS.CARBON_AVOIDED + ':v2';

export async function getCarbonAvoided(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<CarbonMetricsResponse>(CARBON_METRICS_CACHE_KEY);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() } as ApiResponse<CarbonMetricsResponse>);
      return;
    }

    const metrics = await fetchEnvironmentalMetrics();

    // Map backend EnvironmentalMetrics fields to the frontend CarbonMetrics shape
    const data: CarbonMetricsResponse = {
      total_co2_avoided_tons: metrics.co2_avoided_tons,
      equivalent_trees_planted: metrics.trees_equivalent,
      equivalent_cars_off_road: metrics.cars_off_road_equivalent,
      // period_mwh covers ~30 days; use co2_avoided_tons as the monthly figure
      monthly_average_tons: Math.round(metrics.co2_avoided_tons),
    };

    await redisService.set(CARBON_METRICS_CACHE_KEY, data, CACHE_TTL.ENVIRONMENTAL);

    const body: ApiResponse<CarbonMetricsResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.json(body);
  } catch (error) {
    logger.error('environmentController.getCarbonAvoided error:', error);
    next(error);
  }
}
