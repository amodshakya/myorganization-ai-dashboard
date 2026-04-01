import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Car, Wind as WindIcon, TrendingUp } from 'lucide-react';
import { CarbonMetrics } from '../../types';
import { formatNumber } from '../../utils/formatters';

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

interface CarbonMetricItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  unit: string;
  description: string;
}

const CarbonMetricItem: React.FC<CarbonMetricItemProps> = ({
  icon, iconBg, iconColor, label, value, unit, description
}) => {
  const animated = useCountUp(value);
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
      <div className={`flex-shrink-0 p-3 rounded-xl ${iconBg}`}>
        <span className={`block w-6 h-6 ${iconColor}`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {formatNumber(animated)}
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{description}</p>
      </div>
    </div>
  );
};

interface CarbonMetricsPanelProps {
  metrics: CarbonMetrics | null;
  loading?: boolean;
}

export const CarbonMetricsPanel: React.FC<CarbonMetricsPanelProps> = ({ metrics, loading }) => {
  const items = [
    {
      icon: <Leaf className="w-6 h-6" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      label: 'CO₂ Avoided',
      value: metrics?.total_co2_avoided_tons ?? 980000,
      unit: 'tons',
      description: 'Total carbon emission avoided',
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      label: 'Trees Equivalent',
      value: metrics?.equivalent_trees_planted ?? 4410000,
      unit: 'trees',
      description: 'Equivalent trees planted',
    },
    {
      icon: <Car className="w-6 h-6" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      label: 'Cars Off Road',
      value: metrics?.equivalent_cars_off_road ?? 213000,
      unit: 'cars',
      description: 'Equivalent cars removed',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      label: 'Monthly Average',
      value: metrics?.monthly_average_tons ?? 81667,
      unit: 'tons/mo',
      description: 'Average monthly CO₂ saved',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <WindIcon className="w-5 h-5 text-emerald-500" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Environmental Impact
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <CarbonMetricItem key={item.label} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};
