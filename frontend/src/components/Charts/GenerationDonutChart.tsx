import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { EnergySource } from '../../types';
import { getSourceHexColor } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend);

const SOURCES: EnergySource[] = ['solar', 'wind', 'hydro', 'biomass', 'geothermal'];
const SOURCE_LABELS: Record<EnergySource, string> = {
  solar: 'Solar', wind: 'Wind', hydro: 'Hydro', biomass: 'Biomass', geothermal: 'Geothermal',
};

export const GenerationDonutChart: React.FC = () => {
  const { current, loading } = useSelector((state: RootState) => state.generation);

  const { data, total } = useMemo(() => {
    const bySource: Record<string, number> = {};
    for (const d of current) {
      bySource[d.source] = (bySource[d.source] ?? 0) + d.value_mw;
    }
    const values = SOURCES.map((s) => bySource[s] ?? 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      data: values,
      total: sum,
    };
  }, [current]);

  const chartData = {
    labels: SOURCES.map((s) => SOURCE_LABELS[s]),
    datasets: [
      {
        data,
        backgroundColor: SOURCES.map((s) => getSourceHexColor(s) + 'CC'),
        borderColor: SOURCES.map((s) => getSourceHexColor(s)),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { data: number[] }; dataIndex: number; label: string }) => {
            const val = ctx.dataset.data[ctx.dataIndex];
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: ${(val / 1000).toFixed(1)} GW (${pct}%)`;
          },
        },
      },
    },
  };

  if (loading && current.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Current Generation by Source
      </h2>

      <div className="relative flex items-center justify-center" style={{ height: 220 }}>
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(total / 1000).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">GW Total</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {SOURCES.map((source, i) => (
          <div key={source} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getSourceHexColor(source) }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {SOURCE_LABELS[source]}
            </span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 ml-auto">
              {((data[i] ?? 0) / 1000).toFixed(1)} GW
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
