import { Request, Response, NextFunction } from 'express';
import { fetchEnvironmentalMetrics } from '../../services/dataFetchers/ministryOfPowerService';
import { ApiResponse, EnvironmentalMetrics } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/constants';
import logger from '../../logger';

export async function getCarbonAvoided(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<EnvironmentalMetrics>(CACHE_KEYS.CARBON_AVOIDED);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() } as ApiResponse<EnvironmentalMetrics>);
      return;
    }

    const metrics = await fetchEnvironmentalMetrics();

    await redisService.set(CACHE_KEYS.CARBON_AVOIDED, metrics, CACHE_TTL.ENVIRONMENTAL);

    const body: ApiResponse<EnvironmentalMetrics> = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
    res.json(body);
  } catch (error) {
    logger.error('environmentController.getCarbonAvoided error:', error);
    next(error);
  }
}
