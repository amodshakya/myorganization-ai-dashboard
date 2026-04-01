import React from 'react';
import clsx from 'clsx';
import { formatRelativeTime } from '../../utils/formatters';
import { DataSourceStatus } from '../../types';

type StatusVariant = 'active' | 'inactive' | 'error';

const statusConfig: Record<StatusVariant, { dot: string; label: string }> = {
  active: { dot: 'bg-emerald-400 animate-pulse', label: 'Live' },
  inactive: { dot: 'bg-yellow-400', label: 'Stale' },
  error: { dot: 'bg-red-500', label: 'Error' },
};

function resolveStatus(source: DataSourceStatus): StatusVariant {
  if (source.status === 'error') return 'error';
  if (source.status === 'inactive') return 'inactive';
  try {
    const diffMin = (Date.now() - new Date(source.last_updated).getTime()) / 60000;
    if (diffMin > 30) return 'inactive';
  } catch {
    // ignore
  }
  return 'active';
}

interface DataFreshnessIndicatorProps {
  sources: DataSourceStatus[];
  compact?: boolean;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  sources,
  compact = false,
}) => {
  if (!sources.length) return null;

  return (
    <div className={clsx('flex flex-wrap gap-3', compact && 'gap-2')}>
      {sources.map((src) => {
        const variant = resolveStatus(src);
        const cfg = statusConfig[variant];
        return (
          <div
            key={src.name}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border',
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
              compact && 'text-xs'
            )}
          >
            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
            <span className="font-medium text-gray-800 dark:text-gray-200">{src.name}</span>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatRelativeTime(src.last_updated)}
            </span>
            <span
              className={clsx(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                variant === 'active' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                variant === 'inactive' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                variant === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
