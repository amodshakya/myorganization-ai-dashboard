/**
 * Formats MW value to human-readable string (GW if >= 1000).
 */
export declare function formatCapacity(mw: number): string;
/**
 * Calculates CO2 avoided (in tons) for a given MWh of renewable generation.
 */
export declare function calculateCO2Avoided(mwh: number): number;
/**
 * Calculates number of trees equivalent for CO2 avoided.
 */
export declare function calculateTreesEquivalent(co2Tons: number): number;
/**
 * Calculates cars equivalent for CO2 avoided.
 */
export declare function calculateCarsEquivalent(co2Tons: number): number;
/**
 * Generates an array of ISO timestamp strings going back `hours` from now.
 */
export declare function generateTimeSeriesData(hours: number): string[];
/**
 * Returns the two-letter code for an Indian state name.
 */
export declare function getStateCode(stateName: string): string;
/**
 * Returns a random float between min and max (inclusive).
 */
export declare function randomBetween(min: number, max: number): number;
/**
 * Converts MW to GW with two decimal places.
 */
export declare function mwToGw(mw: number): number;
/**
 * Returns the start of the day for a given date.
 */
export declare function startOfDay(date: Date): Date;
/**
 * Adds hours to a date.
 */
export declare function addHours(date: Date, hours: number): Date;
/**
 * Returns the current hour (0-23) in IST (UTC+5:30).
 */
export declare function getCurrentISTHour(): number;
/**
 * Solar output factor based on time of day (IST).
 * Returns 0 at night, peaks around midday.
 */
export declare function solarFactor(): number;
//# sourceMappingURL=helpers.d.ts.map