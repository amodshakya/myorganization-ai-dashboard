import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type ColorVariant = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';

const colorMap: Record<ColorVariant, {
  bg: string;
  iconBg: string;
  iconText: string;
  trendUp: string;
  trendDown: string;
  value: string;
}> = {
  green: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
  blue: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
  yellow: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
  red: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconText: 'text-red-600 dark:text-red-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
  purple: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
  cyan: {
    bg: 'bg-white dark:bg-gray-800',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    trendUp: 'text-emerald-600',
    trendDown: 'text-red-500',
    value: 'text-gray-900 dark:text-white',
  },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color?: ColorVariant;
  loading?: boolean;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'green',
  loading = false,
  subtitle,
}) => {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className={clsx('rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700', c.bg)}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700',
        'hover:shadow-md transition-shadow duration-200',
        c.bg
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('p-2.5 rounded-xl', c.iconBg)}>
          <span className={clsx('block w-5 h-5', c.iconText)}>{icon}</span>
        </div>
        {trend && trendValue !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
              trend === 'up' && 'bg-emerald-50 dark:bg-emerald-900/20 ' + c.trendUp,
              trend === 'down' && 'bg-red-50 dark:bg-red-900/20 ' + c.trendDown,
              trend === 'neutral' && 'bg-gray-100 dark:bg-gray-700 text-gray-500'
            )}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>

      <div className="mt-1">
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
          {unit && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
              {unit}
            </span>
          )}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
