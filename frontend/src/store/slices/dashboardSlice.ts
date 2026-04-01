import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardSummary } from '../../types';
import { getDashboardSummary } from '../../services/api';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await getDashboardSummary();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      return rejectWithValue(msg);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateSummary(state, action: PayloadAction<Partial<DashboardSummary>>) {
      if (state.summary) {
        state.summary = { ...state.summary, ...action.payload };
      } else {
        state.summary = action.payload as DashboardSummary;
      }
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateSummary } = dashboardSlice.actions;
export default dashboardSlice.reducer;
