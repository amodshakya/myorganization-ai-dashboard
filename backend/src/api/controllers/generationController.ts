import { Request, Response, NextFunction } from 'express';
import { fn, col, Op, literal } from 'sequelize';
import { RenewableGeneration, HistoricalData } from '../../models';
import { ApiResponse, GenerationData } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/constants';
import logger from '../../logger';

export async function getCurrentGeneration(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<GenerationData[]>(CACHE_KEYS.CURRENT_GENERATION);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() } as ApiResponse<GenerationData[]>);
      return;
    }

    // Get latest record per source
    const rows = await RenewableGeneration.findAll({
      attributes: [
        'source',
        [fn('MAX', col('timestamp')), 'timestamp'],
        [fn('SUM', col('value_mw')), 'value_mw'],
        'data_source',
      ],
      group: ['source', 'data_source'],
      order: [[literal('"timestamp"'), 'DESC']],
      raw: true,
    }) as unknown as Array<{ source: string; timestamp: string; value_mw: string; data_source: string }>;

    const data = rows.map((r) => ({
      id: '',
      source: r.source as GenerationData['source'],
      value_mw: parseFloat(parseFloat(r.value_mw).toFixed(2)),
      timestamp: new Date(r.timestamp),
      data_source: r.data_source,
    }));

    await redisService.set(CACHE_KEYS.CURRENT_GENERATION, data, CACHE_TTL.CURRENT_GENERATION);

    const body: ApiResponse<typeof data> = { success: true, data, timestamp: new Date().toISOString() };
    res.json(body);
  } catch (error) {
    logger.error('generationController.getCurrentGeneration error:', error);
    next(error);
  }
}

export async function getGenerationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = (req.query.period as string) || '24h';
    const cacheKey = period === '7d' ? CACHE_KEYS.HISTORY_7D : period === '30d' ? CACHE_KEYS.HISTORY_30D : CACHE_KEYS.HISTORY_24H;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
      return;
    }

    const hoursMap: Record<string, number> = { '24h': 24, '7d': 168, '30d': 720 };
    const hours = hoursMap[period] ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const rows = await HistoricalData.findAll({
      where: { timestamp: { [Op.gte]: since } },
      order: [['timestamp', 'ASC']],
      raw: true,
    });

    await redisService.set(cacheKey, rows, CACHE_TTL.HISTORY);

    const body: ApiResponse<typeof rows> = { success: true, data: rows, timestamp: new Date().toISOString() };
    res.json(body);
  } catch (error) {
    logger.error('generationController.getGenerationHistory error:', error);
    next(error);
  }
}
