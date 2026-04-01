import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AppDispatch, RootState } from '../store';
import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
import { fetchCurrentGeneration, fetchGenerationHistory } from '../store/slices/generationSlice';
import { fetchCapacityByState, fetchCapacityByType } from '../store/slices/capacitySlice';
import { getCarbonMetrics } from '../services/api';
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { FilterPanel } from '../components/Dashboard/FilterPanel';
import { DataSourceStatus } from '../components/Dashboard/DataSourceStatus';
import { MetricsRow } from '../components/Dashboard/MetricsRow';
import { GenerationDonutChart } from '../components/Charts/GenerationDonutChart';
import { GenerationTrendChart } from '../components/Charts/GenerationTrendChart';
import { CapacityBarChart } from '../components/Charts/CapacityBarChart';
import { CapacityTypeChart } from '../components/Charts/CapacityTypeChart';
import { CarbonMetricsPanel } from '../components/Dashboard/CarbonMetricsPanel';
import { IndiaMap } from '../components/Map/IndiaMap';
import { StateTable } from '../components/Map/StateTable';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useSSE } from '../hooks/useSSE';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { CarbonMetrics } from '../types';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dateRange = useSelector((s: RootState) => s.filters.dateRange);
  const [carbonMetrics, setCarbonMetrics] = React.useState<CarbonMetrics | null>(null);
  const [carbonLoading, setCarbonLoading] = React.useState(false);

  const isSSEConnected = useSSE();

  const loadAllData = React.useCallback(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchCurrentGeneration());
    dispatch(fetchGenerationHistory(dateRange));
    dispatch(fetchCapacityByState());
    dispatch(fetchCapacityByType());

    setCarbonLoading(true);
    getCarbonMetrics()
      .then(setCarbonMetrics)
      .finally(() => setCarbonLoading(false));
  }, [dispatch, dateRange]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh every 5 minutes
  useAutoRefresh(loadAllData, AUTO_REFRESH_MS);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardHeader isSSEConnected={isSSEConnected} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filter Panel */}
        <ErrorBoundary>
          <FilterPanel />
        </ErrorBoundary>

        {/* Data source status */}
        <ErrorBoundary>
          <DataSourceStatus />
        </ErrorBoundary>

        {/* Metrics Row */}
        <ErrorBoundary>
          <MetricsRow />
        </ErrorBoundary>

        {/* Generation Donut + Carbon Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <GenerationDonutChart />
          </ErrorBoundary>
          <ErrorBoundary>
            <CarbonMetricsPanel metrics={carbonMetrics} loading={carbonLoading} />
          </ErrorBoundary>
        </div>

        {/* Generation Trend */}
        <ErrorBoundary>
          <GenerationTrendChart />
        </ErrorBoundary>

        {/* Capacity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <CapacityBarChart />
          </ErrorBoundary>
          <ErrorBoundary>
            <CapacityTypeChart />
          </ErrorBoundary>
        </div>

        {/* India Heatmap */}
        <ErrorBoundary>
          <IndiaMap />
        </ErrorBoundary>

        {/* State Table */}
        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              State-wise Renewable Capacity
            </h2>
            <StateTable />
          </div>
        </ErrorBoundary>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            borderRadius: '0.75rem',
            border: '1px solid var(--toast-border)',
          },
        }}
      />
    </div>
  );
};
