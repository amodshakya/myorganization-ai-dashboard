import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { EnergySource } from '../../types';
import { getSourceHexColor } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';

const SOURCE_LABELS: Record<EnergySource, string> = {
  solar: 'Solar', wind: 'Wind', hydro: 'Hydro', biomass: 'Biomass', geothermal: 'Geothermal',
};

export const CapacityTypeChart: React.FC = () => {
  const { byType, loading } = useSelector((state: RootState) => state.capacity);

  const { labels, data, colors } = useMemo(() => {
    const sorted = [...byType].sort((a, b) => b.total_capacity_mw - a.total_capacity_mw);
    return {
      labels: sorted.map((t) => SOURCE_LABELS[t.source_type] ?? t.source_type),
      data: sorted.map((t) => +(t.total_capacity_mw / 1000).toFixed(1)),
      colors: sorted.map((t) => getSourceHexColor(t.source_type)),
    };
  }, [byType]);

  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.map((c) => c + 'CC'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) => {
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: ${ctx.parsed.toFixed(1)} GW (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Capacity Distribution by Type
      </h2>

      <div style={{ height: 200 }} className="relative flex items-center justify-center">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : byType.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available</p>
        ) : (
          <>
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{total.toFixed(0)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">GW Total</p>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2 mt-4">
        {labels.map((label, i) => {
          const pct = total > 0 ? ((data[i] / total) * 100).toFixed(1) : '0';
          return (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[i] }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: colors[i] }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
