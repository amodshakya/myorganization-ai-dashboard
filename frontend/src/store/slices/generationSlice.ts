import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GenerationData, HistoricalDataPoint } from '../../types';
import { getCurrentGeneration, getGenerationHistory } from '../../services/api';

interface GenerationState {
  current: GenerationData[];
  history: HistoricalDataPoint[];
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
}

const initialState: GenerationState = {
  current: [],
  history: [],
  loading: false,
  historyLoading: false,
  error: null,
};

export const fetchCurrentGeneration = createAsyncThunk(
  'generation/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentGeneration();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch generation data';
      return rejectWithValue(msg);
    }
  }
);

export const fetchGenerationHistory = createAsyncThunk(
  'generation/fetchHistory',
  async (period: string, { rejectWithValue }) => {
    try {
      return await getGenerationHistory(period);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch generation history';
      return rejectWithValue(msg);
    }
  }
);

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentGeneration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentGeneration.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchCurrentGeneration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGenerationHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchGenerationHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchGenerationHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default generationSlice.reducer;
