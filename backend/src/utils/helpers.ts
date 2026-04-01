import { CO2_FACTOR, STATE_CODES, TREES_PER_TON_CO2, CO2_TONS_PER_CAR_YEAR } from './constants';

/**
 * Formats MW value to human-readable string (GW if >= 1000).
 */
export function formatCapacity(mw: number): string {
  if (mw >= 1000) {
    return `${(mw / 1000).toFixed(2)} GW`;
  }
  return `${mw.toFixed(2)} MW`;
}

/**
 * Calculates CO2 avoided (in tons) for a given MWh of renewable generation.
 */
export function calculateCO2Avoided(mwh: number): number {
  return parseFloat((mwh * CO2_FACTOR).toFixed(2));
}

/**
 * Calculates number of trees equivalent for CO2 avoided.
 */
export function calculateTreesEquivalent(co2Tons: number): number {
  return Math.round(co2Tons * TREES_PER_TON_CO2);
}

/**
 * Calculates cars equivalent for CO2 avoided.
 */
export function calculateCarsEquivalent(co2Tons: number): number {
  return Math.round(co2Tons / CO2_TONS_PER_CAR_YEAR);
}

/**
 * Generates an array of ISO timestamp strings going back `hours` from now.
 */
export function generateTimeSeriesData(hours: number): string[] {
  const timestamps: string[] = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000);
    timestamps.push(ts.toISOString());
  }
  return timestamps;
}

/**
 * Returns the two-letter code for an Indian state name.
 */
export function getStateCode(stateName: string): string {
  return STATE_CODES[stateName] ?? stateName.slice(0, 2).toUpperCase();
}

/**
 * Returns a random float between min and max (inclusive).
 */
export function randomBetween(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Converts MW to GW with two decimal places.
 */
export function mwToGw(mw: number): number {
  return parseFloat((mw / 1000).toFixed(2));
}

/**
 * Returns the start of the day for a given date.
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Adds hours to a date.
 */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Returns the current hour (0-23) in IST (UTC+5:30).
 */
export function getCurrentISTHour(): number {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const istHour = (utcHour + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
  return istHour % 24;
}

/**
 * Solar output factor based on time of day (IST).
 * Returns 0 at night, peaks around midday.
 */
export function solarFactor(): number {
  const hour = getCurrentISTHour();
  if (hour < 6 || hour >= 20) return 0;
  // Bell curve peaking at 13:00 IST
  const peak = 13;
  const spread = 5;
  return Math.max(0, Math.exp(-Math.pow(hour - peak, 2) / (2 * spread * spread)));
}
