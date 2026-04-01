import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState, EnergySource } from '../../types';

const initialState: FilterState = {
  state: 'all',
  energyType: 'all',
  dateRange: '24h',
  searchQuery: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setStateFilter(state, action: PayloadAction<string>) {
      state.state = action.payload;
    },
    setEnergyTypeFilter(state, action: PayloadAction<EnergySource | 'all'>) {
      state.energyType = action.payload;
    },
    setDateRange(state, action: PayloadAction<'24h' | '7d' | '30d'>) {
      state.dateRange = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetFilters(state) {
      state.state = 'all';
      state.energyType = 'all';
      state.dateRange = '24h';
      state.searchQuery = '';
    },
  },
});

export const {
  setStateFilter,
  setEnergyTypeFilter,
  setDateRange,
  setSearchQuery,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
