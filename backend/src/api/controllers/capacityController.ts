import { Request, Response, NextFunction } from 'express';
import { fn, col } from 'sequelize';
import { RenewableCapacity } from '../../models';
import { ApiResponse, StateCapacity } from '../../types';
import { redisService } from '../../services/caching/redisService';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/constants';
import logger from '../../logger';

export async function getCapacityByState(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get<StateCapacity[]>(CACHE_KEYS.CAPACITY_BY_STATE);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() } as ApiResponse<StateCapacity[]>);
      return;
    }

    const rows = await RenewableCapacity.findAll({
      attributes: [
        'state',
        'source_type',
        [fn('SUM', col('capacity_mw')), 'capacity_mw'],
      ],
      group: ['state', 'source_type'],
      raw: true,
    }) as unknown as Array<{ state: string; source_type: string; capacity_mw: string }>;

    const stateMap: Record<string, StateCapacity> = {};
    for (const row of rows) {
      if (!stateMap[row.state]) {
        stateMap[row.state] = { state: row.state, solar_mw: 0, wind_mw: 0, hydro_mw: 0, biomass_mw: 0, geothermal_mw: 0, total_mw: 0 };
      }
      const mw = parseFloat(row.capacity_mw);
      const key = `${row.source_type}_mw` as keyof StateCapacity;
      if (key in stateMap[row.state]) {
        (stateMap[row.state][key] as number) += mw;
      }
      stateMap[row.state].total_mw += mw;
    }

    const data = Object.values(stateMap).sort((a, b) => b.total_mw - a.total_mw);

    await redisService.set(CACHE_KEYS.CAPACITY_BY_STATE, data, CACHE_TTL.CAPACITY);

    const body: ApiResponse<StateCapacity[]> = { success: true, data, timestamp: new Date().toISOString() };
    res.json(body);
  } catch (error) {
    logger.error('capacityController.getCapacityByState error:', error);
    next(error);
  }
}

export async function getCapacityByType(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = await redisService.get(CACHE_KEYS.CAPACITY_BY_TYPE);
    if (cached) {
      res.json({ success: true, data: cached, timestamp: new Date().toISOString() });
      return;
    }

    const rows = await RenewableCapacity.findAll({
      attributes: [
        'source_type',
        [fn('SUM', col('capacity_mw')), 'total_capacity_mw'],
        [fn('COUNT', col('id')), 'state_count'],
      ],
      group: ['source_type'],
      raw: true,
    }) as unknown as Array<{ source_type: string; total_capacity_mw: string; state_count: string }>;

    const totalMW = rows.reduce((s, r) => s + parseFloat(r.total_capacity_mw), 0);

    const data = rows.map((r) => ({
      source_type: r.source_type,
      total_capacity_mw: parseFloat(parseFloat(r.total_capacity_mw).toFixed(2)),
      total_capacity_gw: parseFloat((parseFloat(r.total_capacity_mw) / 1000).toFixed(2)),
      states_count: parseInt(r.state_count, 10),
      percentage: parseFloat(((parseFloat(r.total_capacity_mw) / totalMW) * 100).toFixed(2)),
    })).sort((a, b) => b.total_capacity_mw - a.total_capacity_mw);

    await redisService.set(CACHE_KEYS.CAPACITY_BY_TYPE, data, CACHE_TTL.CAPACITY);

    const body: ApiResponse<typeof data> = { success: true, data, timestamp: new Date().toISOString() };
    res.json(body);
  } catch (error) {
    logger.error('capacityController.getCapacityByType error:', error);
    next(error);
  }
}
