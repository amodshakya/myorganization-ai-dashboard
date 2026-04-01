import React, { useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setSearchQuery } from '../../store/slices/filterSlice';

function useDebounce(fn: (val: string) => void, delay: number) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(val), delay);
    },
    [fn, delay]
  );
}

interface SearchBarProps {
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search…' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const storeQuery = useSelector((s: RootState) => s.filters.searchQuery);
  const [localValue, setLocalValue] = useState(storeQuery);

  const dispatchDebounced = useDebounce(
    (val: string) => dispatch(setSearchQuery(val)),
    300
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    dispatchDebounced(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    dispatch(setSearchQuery(''));
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
