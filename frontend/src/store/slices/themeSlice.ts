import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../types';

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // localStorage unavailable
  }
  return 'light';
};

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', state.theme);
      } catch {
        // localStorage unavailable
      }
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      try {
        localStorage.setItem('theme', action.payload);
      } catch {
        // localStorage unavailable
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
