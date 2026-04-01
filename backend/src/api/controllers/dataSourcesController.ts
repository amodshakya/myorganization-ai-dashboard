import { Request, Response, NextFunction } from 'express';
import { DataSource } from '../../models';
import { ApiResponse, DataSourceStatus } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/constants';
import logger from '../../logger';

export async function getDataSourceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<DataSourceStatus[]>(CACHE_KEYS.DATA_SOURCES);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() } as ApiResponse<DataSourceStatus[]>);
      return;
    }

    const sources = await DataSource.findAll({ raw: true });
    const data: DataSourceStatus[] = sources.map((s) => ({
      name: s.name,
      last_updated: s.last_updated,
      status: s.status,
      next_update: s.next_update,
      records_count: s.records_count,
    }));

    await redisService.set(CACHE_KEYS.DATA_SOURCES, data, CACHE_TTL.DATA_SOURCES);

    const body: ApiResponse<DataSourceStatus[]> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.json(body);
  } catch (error) {
    logger.error('dataSourcesController.getDataSourceStatus error:', error);
    next(error);
  }
}
