import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LoadingSpinner } from '../common/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const CapacityBarChart: React.FC = () => {
  const { byState, loading } = useSelector((state: RootState) => state.capacity);

  const top10 = useMemo(
    () => [...byState].sort((a, b) => b.total_mw - a.total_mw).slice(0, 10),
    [byState]
  );

  const labels = top10.map((s) => s.state);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Solar',
        data: top10.map((s) => Math.round(s.solar_mw / 1000)),
        backgroundColor: '#F59E0BCC',
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Wind',
        data: top10.map((s) => Math.round(s.wind_mw / 1000)),
        backgroundColor: '#3B82F6CC',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Hydro',
        data: top10.map((s) => Math.round(s.hydro_mw / 1000)),
        backgroundColor: '#06B6D4CC',
        borderColor: '#06B6D4',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Biomass',
        data: top10.map((s) => Math.round(s.biomass_mw / 1000)),
        backgroundColor: '#10B981CC',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 12,
          color: '#9CA3AF',
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const x = ctx.parsed.x ?? 0;
            return ` ${ctx.dataset.label}: ${x.toFixed(1)} GW`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: '#1F293720' },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          callback: (v: string | number) => `${v} GW`,
        },
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#9CA3AF', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Top 10 States — Installed Capacity
      </h2>

      <div style={{ height: 340 }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : top10.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No capacity data available
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};
