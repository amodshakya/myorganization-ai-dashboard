module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        solar: { 500: '#F59E0B', 600: '#D97706' },
        wind: { 500: '#3B82F6', 600: '#2563EB' },
        hydro: { 500: '#06B6D4', 600: '#0891B2' },
        biomass: { 500: '#10B981', 600: '#059669' },
        geothermal: { 500: '#EF4444', 600: '#DC2626' },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
