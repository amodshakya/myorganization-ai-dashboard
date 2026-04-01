import { CapacityData, EnvironmentalMetrics } from '../../types';
export declare function fetchNationalStats(): Promise<{
    total_installed_gw: number;
    target_2030_gw: number;
}>;
export declare function fetchStatewiseData(): Promise<CapacityData[]>;
export declare function fetchEnvironmentalMetrics(): Promise<EnvironmentalMetrics>;
//# sourceMappingURL=ministryOfPowerService.d.ts.map