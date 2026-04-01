import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';
import { RootState } from '../../store';
import { StateCapacity } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

type SortKey = keyof Omit<StateCapacity, 'state'> | 'state';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

function CapacityBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[40px]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
        {(value / 1000).toFixed(1)}
      </span>
    </div>
  );
}

const COLUMNS: { key: SortKey; label: string; color?: string }[] = [
  { key: 'state', label: 'State' },
  { key: 'solar_mw', label: 'Solar', color: '#F59E0B' },
  { key: 'wind_mw', label: 'Wind', color: '#3B82F6' },
  { key: 'hydro_mw', label: 'Hydro', color: '#06B6D4' },
  { key: 'biomass_mw', label: 'Biomass', color: '#10B981' },
  { key: 'total_mw', label: 'Total', color: '#8B5CF6' },
];

export const StateTable: React.FC = () => {
  const { byState, loading } = useSelector((state: RootState) => state.capacity);
  const searchQuery = useSelector((s: RootState) => s.filters.searchQuery);

  const [sortKey, setSortKey] = useState<SortKey>('total_mw');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return byState.filter((s) => !q || s.state.toLowerCase().includes(q));
  }, [byState, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = sortKey === 'state' ? a.state : (a[sortKey as keyof StateCapacity] as number);
      const bv = sortKey === 'state' ? b.state : (b[sortKey as keyof StateCapacity] as number);
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc'
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const maxByCol = useMemo(() => {
    const mx: Partial<Record<SortKey, number>> = {};
    for (const col of COLUMNS) {
      if (col.key !== 'state') {
        mx[col.key] = Math.max(...byState.map((s) => (s[col.key as keyof StateCapacity] as number) ?? 0));
      }
    }
    return mx;
  }, [byState]);

  // Total row calculation
  const totals = useMemo(() => {
    return {
      solar_mw: sorted.reduce((s, r) => s + r.solar_mw, 0),
      wind_mw: sorted.reduce((s, r) => s + r.wind_mw, 0),
      hydro_mw: sorted.reduce((s, r) => s + r.hydro_mw, 0),
      biomass_mw: sorted.reduce((s, r) => s + r.biomass_mw, 0),
      total_mw: sorted.reduce((s, r) => s + r.total_mw, 0),
    };
  }, [sorted]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-gray-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-emerald-500" />
      : <ChevronDown className="w-3 h-3 text-emerald-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    {col.color && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    )}
                    {col.label}
                    <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paged.map((state) => {
              const share = totals.total_mw > 0
                ? ((state.total_mw / totals.total_mw) * 100).toFixed(1)
                : '0';
              return (
                <tr
                  key={state.state}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {state.state}
                  </td>
                  <td className="px-4 py-3">
                    <CapacityBar
                      value={state.solar_mw}
                      max={maxByCol.solar_mw ?? 1}
                      color="#F59E0B"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CapacityBar
                      value={state.wind_mw}
                      max={maxByCol.wind_mw ?? 1}
                      color="#3B82F6"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CapacityBar
                      value={state.hydro_mw}
                      max={maxByCol.hydro_mw ?? 1}
                      color="#06B6D4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CapacityBar
                      value={state.biomass_mw}
                      max={maxByCol.biomass_mw ?? 1}
                      color="#10B981"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {(state.total_mw / 1000).toFixed(1)} GW
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{share}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary row */}
          <tfoot>
            <tr className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 font-semibold">
              <td className="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                All ({sorted.length})
              </td>
              {(['solar_mw', 'wind_mw', 'hydro_mw', 'biomass_mw'] as const).map((k) => (
                <td key={k} className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                  {(totals[k] / 1000).toFixed(1)} GW
                </td>
              ))}
              <td className="px-4 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {(totals.total_mw / 1000).toFixed(1)} GW
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} states
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                page === 1
                  ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  'w-8 h-8 text-sm rounded-lg border transition-colors',
                  p === page
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                page === totalPages
                  ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
