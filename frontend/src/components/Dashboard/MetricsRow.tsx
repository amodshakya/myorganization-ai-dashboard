import React from 'react';
import { useSelector } from 'react-redux';
import { Zap, Activity, PieChart, Leaf, TrendingUp, Radio } from 'lucide-react';
import { RootState } from '../../store';
import { MetricCard } from '../common/MetricCard';

export const MetricsRow: React.FC = () => {
  const { summary, loading } = useSelector((state: RootState) => state.dashboard);

  const metrics = [
    {
      title: 'Total Installed Capacity',
      value: summary ? summary.total_capacity_gw.toFixed(1) : '—',
      unit: 'GW',
      icon: <Zap className="w-5 h-5" />,
      color: 'green' as const,
      trend: 'up' as const,
      trendValue: 8.3,
      subtitle: 'All renewable sources',
    },
    {
      title: 'Current Generation',
      value: summary ? summary.current_generation_gw.toFixed(1) : '—',
      unit: 'GW',
      icon: <Activity className="w-5 h-5" />,
      color: 'blue' as const,
      trend: 'up' as const,
      trendValue: 3.1,
      subtitle: 'Real-time output',
    },
    {
      title: 'Renewable Share',
      value: summary ? summary.renewable_percentage.toFixed(1) : '—',
      unit: '%',
      icon: <PieChart className="w-5 h-5" />,
      color: 'yellow' as const,
      trend: 'up' as const,
      trendValue: 1.8,
      subtitle: 'Of total grid mix',
    },
    {
      title: 'CO₂ Avoided',
      value: summary
        ? summary.co2_avoided_tons >= 1_000_000
          ? (summary.co2_avoided_tons / 1_000_000).toFixed(2)
          : (summary.co2_avoided_tons / 1000).toFixed(0)
        : '—',
      unit: summary && summary.co2_avoided_tons >= 1_000_000 ? 'MT' : 'KT',
      icon: <Leaf className="w-5 h-5" />,
      color: 'green' as const,
      trend: 'up' as const,
      trendValue: 5.2,
      subtitle: 'This month',
    },
    {
      title: 'Peak Load',
      value: summary ? summary.peak_load_gw.toFixed(1) : '—',
      unit: 'GW',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'red' as const,
      trend: 'neutral' as const,
      trendValue: 0.4,
      subtitle: 'National grid',
    },
    {
      title: 'Grid Frequency',
      value: summary ? summary.grid_frequency.toFixed(2) : '—',
      unit: 'Hz',
      icon: <Radio className="w-5 h-5" />,
      color: 'purple' as const,
      trend: (summary && Math.abs(summary.grid_frequency - 50) < 0.1 ? 'neutral' : 'down') as 'up' | 'down' | 'neutral',
      trendValue: summary ? +(Math.abs(summary.grid_frequency - 50) * 100).toFixed(2) : 0,
      subtitle: 'Nominal: 50 Hz',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m) => (
        <MetricCard key={m.title} {...m} loading={loading} />
      ))}
    </div>
  );
};
