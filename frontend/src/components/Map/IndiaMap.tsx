import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { StateCapacity } from '../../types';
import clsx from 'clsx';

const INTENSITY_CLASSES = [
  { min: 0, max: 5, bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-800 dark:text-emerald-200', label: '< 5 GW' },
  { min: 5, max: 10, bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-900 dark:text-emerald-100', label: '5–10 GW' },
  { min: 10, max: 15, bg: 'bg-emerald-200 dark:bg-emerald-800', text: 'text-emerald-900 dark:text-white', label: '10–15 GW' },
  { min: 15, max: 20, bg: 'bg-emerald-400 dark:bg-emerald-700', text: 'text-white dark:text-white', label: '15–20 GW' },
  { min: 20, max: Infinity, bg: 'bg-emerald-600 dark:bg-emerald-600', text: 'text-white', label: '> 20 GW' },
];

function getIntensityClass(totalGW: number) {
  return INTENSITY_CLASSES.find((c) => totalGW >= c.min && totalGW < c.max) ?? INTENSITY_CLASSES[0];
}

interface StateCardProps {
  state: StateCapacity;
  onHover: (state: StateCapacity | null) => void;
  isHovered: boolean;
}

const StateCard: React.FC<StateCardProps> = ({ state, onHover, isHovered }) => {
  const totalGW = state.total_mw / 1000;
  const cls = getIntensityClass(totalGW);

  return (
    <div
      className={clsx(
        'relative p-2 rounded-lg cursor-pointer transition-all duration-150 border',
        cls.bg,
        isHovered
          ? 'scale-105 shadow-lg z-10 border-emerald-500'
          : 'border-transparent hover:border-emerald-300 hover:scale-105'
      )}
      onMouseEnter={() => onHover(state)}
      onMouseLeave={() => onHover(null)}
    >
      <p className={clsx('text-xs font-semibold truncate', cls.text)}>
        {state.state.length > 12 ? state.state.slice(0, 11) + '…' : state.state}
      </p>
      <p className={clsx('text-xs font-bold', cls.text)}>{totalGW.toFixed(1)} GW</p>
    </div>
  );
};

interface TooltipData {
  state: StateCapacity;
}

const StateTooltip: React.FC<TooltipData> = ({ state }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]">
    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{state.state}</h4>
    <div className="space-y-1 text-sm">
      {[
        { label: '☀️ Solar', value: state.solar_mw, color: '#F59E0B' },
        { label: '💨 Wind', value: state.wind_mw, color: '#3B82F6' },
        { label: '💧 Hydro', value: state.hydro_mw, color: '#06B6D4' },
        { label: '🌿 Biomass', value: state.biomass_mw, color: '#10B981' },
      ].map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4">
          <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {(item.value / 1000).toFixed(1)} GW
          </span>
        </div>
      ))}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1 flex justify-between">
        <span className="font-bold text-gray-700 dark:text-gray-300">Total</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {(state.total_mw / 1000).toFixed(1)} GW
        </span>
      </div>
    </div>
  </div>
);

export const IndiaMap: React.FC = () => {
  const { byState } = useSelector((state: RootState) => state.capacity);
  const [hovered, setHovered] = React.useState<StateCapacity | null>(null);

  // Sort by total descending for display
  const sorted = useMemo(() => [...byState].sort((a, b) => b.total_mw - a.total_mw), [byState]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        State-wise Capacity Heatmap
      </h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        Hover over a state to see details
      </p>

      <div className="relative">
        {/* State grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {sorted.map((state) => (
            <StateCard
              key={state.state}
              state={state}
              onHover={setHovered}
              isHovered={hovered?.state === state.state}
            />
          ))}
        </div>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute top-0 right-0 z-20 pointer-events-none">
            <StateTooltip state={hovered} />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Capacity:</span>
        {INTENSITY_CLASSES.map((cls) => (
          <div key={cls.label} className="flex items-center gap-1.5">
            <span className={clsx('w-4 h-4 rounded', cls.bg, 'border border-gray-200 dark:border-gray-600')} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{cls.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
