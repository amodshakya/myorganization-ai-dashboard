"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCapacity = formatCapacity;
exports.calculateCO2Avoided = calculateCO2Avoided;
exports.calculateTreesEquivalent = calculateTreesEquivalent;
exports.calculateCarsEquivalent = calculateCarsEquivalent;
exports.generateTimeSeriesData = generateTimeSeriesData;
exports.getStateCode = getStateCode;
exports.randomBetween = randomBetween;
exports.mwToGw = mwToGw;
exports.startOfDay = startOfDay;
exports.addHours = addHours;
exports.getCurrentISTHour = getCurrentISTHour;
exports.solarFactor = solarFactor;
const constants_1 = require("./constants");
/**
 * Formats MW value to human-readable string (GW if >= 1000).
 */
function formatCapacity(mw) {
    if (mw >= 1000) {
        return `${(mw / 1000).toFixed(2)} GW`;
    }
    return `${mw.toFixed(2)} MW`;
}
/**
 * Calculates CO2 avoided (in tons) for a given MWh of renewable generation.
 */
function calculateCO2Avoided(mwh) {
    return parseFloat((mwh * constants_1.CO2_FACTOR).toFixed(2));
}
/**
 * Calculates number of trees equivalent for CO2 avoided.
 */
function calculateTreesEquivalent(co2Tons) {
    return Math.round(co2Tons * constants_1.TREES_PER_TON_CO2);
}
/**
 * Calculates cars equivalent for CO2 avoided.
 */
function calculateCarsEquivalent(co2Tons) {
    return Math.round(co2Tons / constants_1.CO2_TONS_PER_CAR_YEAR);
}
/**
 * Generates an array of ISO timestamp strings going back `hours` from now.
 */
function generateTimeSeriesData(hours) {
    const timestamps = [];
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
function getStateCode(stateName) {
    return constants_1.STATE_CODES[stateName] ?? stateName.slice(0, 2).toUpperCase();
}
/**
 * Returns a random float between min and max (inclusive).
 */
function randomBetween(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
/**
 * Converts MW to GW with two decimal places.
 */
function mwToGw(mw) {
    return parseFloat((mw / 1000).toFixed(2));
}
/**
 * Returns the start of the day for a given date.
 */
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
/**
 * Adds hours to a date.
 */
function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
/**
 * Returns the current hour (0-23) in IST (UTC+5:30).
 */
function getCurrentISTHour() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const istHour = (utcHour + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
    return istHour % 24;
}
/**
 * Solar output factor based on time of day (IST).
 * Returns 0 at night, peaks around midday.
 */
function solarFactor() {
    const hour = getCurrentISTHour();
    if (hour < 6 || hour >= 20)
        return 0;
    // Bell curve peaking at 13:00 IST
    const peak = 13;
    const spread = 5;
    return Math.max(0, Math.exp(-Math.pow(hour - peak, 2) / (2 * spread * spread)));
}
//# sourceMappingURL=helpers.js.map