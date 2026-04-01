import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { RootState, AppDispatch } from '../../store';
import { fetchGenerationHistory } from '../../store/slices/generationSlice';
import { setDateRange } from '../../store/slices/filterSlice';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PERIODS: { label: string; value: '24h' | '7d' | '30d' }[] = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

function formatLabel(ts: string, period: string): string {
  try {
    const d = new Date(ts);
    if (period === '24h') return format(d, 'HH:mm');
    if (period === '7d') return format(d, 'EEE dd');
    return format(d, 'dd MMM');
  } catch {
    return ts;
  }
}

// Downsample to avoid too many points
function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

export const GenerationTrendChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, historyLoading } = useSelector((state: RootState) => state.generation);
  const currentPeriod = useSelector((state: RootState) => state.filters.dateRange);

  const handlePeriodChange = (period: '24h' | '7d' | '30d') => {
    dispatch(setDateRange(period));
    dispatch(fetchGenerationHistory(period));
  };

  const maxPoints = currentPeriod === '30d' ? 60 : currentPeriod === '7d' ? 84 : 24;
  const sampled = useMemo(() => downsample(history, maxPoints), [history, maxPoints]);

  const labels = sampled.map((d) => formatLabel(d.timestamp, currentPeriod));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Solar',
        data: sampled.map((d) => Math.round(d.solar_mw / 1000)),
        borderColor: '#F59E0B',
        backgroundColor: '#F59E0B1A',
        fill: false,
        tension: 0.4,
        pointRadius: currentPeriod === '24h' ? 3 : 1,
        borderWidth: 2,
      },
      {
        label: 'Wind',
        data: sampled.map((d) => Math.round(d.wind_mw / 1000)),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F61A',
        fill: false,
        tension: 0.4,
        pointRadius: currentPeriod === '24h' ? 3 : 1,
        borderWidth: 2,
      },
      {
        label: 'Hydro',
        data: sampled.map((d) => Math.round(d.hydro_mw / 1000)),
        borderColor: '#06B6D4',
        backgroundColor: '#06B6D41A',
        fill: false,
        tension: 0.4,
        pointRadius: currentPeriod === '24h' ? 3 : 1,
        borderWidth: 2,
      },
      {
        label: 'Biomass',
        data: sampled.map((d) => Math.round(d.biomass_mw / 1000)),
        borderColor: '#10B981',
        backgroundColor: '#10B9811A',
        fill: false,
        tension: 0.4,
        pointRadius: currentPeriod === '24h' ? 3 : 1,
        borderWidth: 2,
      },
      {
        label: 'Total',
        data: sampled.map((d) => Math.round(d.total_mw / 1000)),
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF61A',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5,
        borderDash: [6, 3] as number[],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
          color: '#9CA3AF',
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const y = ctx.parsed.y ?? 0;
            return ` ${ctx.dataset.label}: ${y.toFixed(1)} GW`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1F293720', display: true },
        ticks: { color: '#9CA3AF', font: { size: 11 }, maxTicksLimit: 12 },
      },
      y: {
        grid: { color: '#1F293720', display: true },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          callback: (v: string | number) => `${v} GW`,
        },
        title: { display: true, text: 'Generation (GW)', color: '#9CA3AF', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Generation Trend
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                currentPeriod === p.value
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 280 }} className="relative">
        {historyLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : history.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No historical data available
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};
