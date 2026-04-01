import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, RotateCcw, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { RootState, AppDispatch } from '../../store';
import {
  setStateFilter,
  setEnergyTypeFilter,
  setDateRange,
  setSearchQuery,
  resetFilters,
} from '../../store/slices/filterSlice';
import { EnergySource } from '../../types';

const INDIAN_STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const ENERGY_TYPES: { label: string; value: EnergySource | 'all'; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '⚡' },
  { label: 'Solar', value: 'solar', emoji: '☀️' },
  { label: 'Wind', value: 'wind', emoji: '💨' },
  { label: 'Hydro', value: 'hydro', emoji: '💧' },
  { label: 'Biomass', value: 'biomass', emoji: '🌿' },
  { label: 'Geothermal', value: 'geothermal', emoji: '🌋' },
];

const DATE_RANGES: { label: string; value: '24h' | '7d' | '30d' }[] = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

export const FilterPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.filters);

  const hasActiveFilters =
    filters.state !== 'all' ||
    filters.energyType !== 'all' ||
    filters.dateRange !== '24h' ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search states, sources..."
            value={filters.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => dispatch(setSearchQuery(''))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* State dropdown */}
        <div className="relative">
          <select
            value={filters.state}
            onChange={(e) =>
              dispatch(setStateFilter(e.target.value === 'All States' ? 'all' : e.target.value))
            }
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 cursor-pointer min-w-[150px]"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s === 'All States' ? 'all' : s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date range */}
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 gap-1">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.value}
              onClick={() => dispatch(setDateRange(dr.value))}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                filters.dateRange === dr.value
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {dr.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Energy type pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {ENERGY_TYPES.map((et) => (
          <button
            key={et.value}
            onClick={() => dispatch(setEnergyTypeFilter(et.value))}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all',
              filters.energyType === et.value
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400'
            )}
          >
            <span>{et.emoji}</span>
            {et.label}
          </button>
        ))}
      </div>
    </div>
  );
};
