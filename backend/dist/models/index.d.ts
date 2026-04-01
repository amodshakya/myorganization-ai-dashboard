import { sequelize } from '../config/database';
import RenewableGeneration from './RenewableGeneration';
import RenewableCapacity from './RenewableCapacity';
import HistoricalData from './HistoricalData';
import DataSource from './DataSource';
export { RenewableGeneration, RenewableCapacity, HistoricalData, DataSource, sequelize };
export declare function syncModels(force?: boolean): Promise<void>;
//# sourceMappingURL=index.d.ts.map