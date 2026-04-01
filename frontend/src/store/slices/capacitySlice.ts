import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StateCapacity, CapacityByType } from '../../types';
import { getCapacityByState, getCapacityByType } from '../../services/api';

interface CapacityState {
  byState: StateCapacity[];
  byType: CapacityByType[];
  loading: boolean;
  error: string | null;
}

const initialState: CapacityState = {
  byState: [],
  byType: [],
  loading: false,
  error: null,
};

export const fetchCapacityByState = createAsyncThunk(
  'capacity/fetchByState',
  async (_, { rejectWithValue }) => {
    try {
      return await getCapacityByState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch capacity by state';
      return rejectWithValue(msg);
    }
  }
);

export const fetchCapacityByType = createAsyncThunk(
  'capacity/fetchByType',
  async (_, { rejectWithValue }) => {
    try {
      return await getCapacityByType();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch capacity by type';
      return rejectWithValue(msg);
    }
  }
);

const capacitySlice = createSlice({
  name: 'capacity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCapacityByState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapacityByState.fulfilled, (state, action) => {
        state.loading = false;
        state.byState = action.payload;
      })
      .addCase(fetchCapacityByState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCapacityByType.fulfilled, (state, action) => {
        state.byType = action.payload;
      });
  },
});

export default capacitySlice.reducer;
