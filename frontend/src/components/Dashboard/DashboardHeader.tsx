import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Leaf, Moon, Sun, RefreshCw, Download, Wifi } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { fetchDashboardSummary } from '../../store/slices/dashboardSlice';
import { fetchCurrentGeneration, fetchGenerationHistory } from '../../store/slices/generationSlice';
import { fetchCapacityByState, fetchCapacityByType } from '../../store/slices/capacitySlice';
import { exportCSV } from '../../services/api';
import { formatTimestamp } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface DashboardHeaderProps {
  isSSEConnected: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isSSEConnected }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const lastUpdated = useSelector((state: RootState) => state.dashboard.lastUpdated);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchDashboardSummary()),
        dispatch(fetchCurrentGeneration()),
        dispatch(fetchGenerationHistory('24h')),
        dispatch(fetchCapacityByState()),
        dispatch(fetchCapacityByType()),
      ]);
      toast.success('Data refreshed');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `renewable-energy-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title + badges */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                India Renewable Energy Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {['MNRE', 'CEA', 'Ministry of Power'].map((source) => (
                  <span
                    key={source}
                    className="px-2 py-0.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800"
                  >
                    {source}
                  </span>
                ))}
                <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${isSSEConnected ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}`}>
                  <Wifi className="w-3 h-3" />
                  {isSSEConnected ? 'Live' : 'Polling'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden lg:block">
                Updated {formatTimestamp(lastUpdated)}
              </span>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:block">Export</span>
            </button>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
