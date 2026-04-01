import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DataFreshnessIndicator } from '../common/DataFreshnessIndicator';
import { Database } from 'lucide-react';

export const DataSourceStatus: React.FC = () => {
  const summary = useSelector((state: RootState) => state.dashboard.summary);
  const sources = summary?.data_sources ?? [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data Sources</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">· {sources.length} connected</span>
      </div>
      {sources.length > 0 ? (
        <DataFreshnessIndicator sources={sources} compact />
      ) : (
        <div className="flex flex-wrap gap-3">
          {['MNRE', 'CEA', 'Ministry of Power'].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
