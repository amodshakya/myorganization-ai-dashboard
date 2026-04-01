import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import generationReducer from './slices/generationSlice';
import capacityReducer from './slices/capacitySlice';
import filterReducer from './slices/filterSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    generation: generationReducer,
    capacity: capacityReducer,
    filters: filterReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
