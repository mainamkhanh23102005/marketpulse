import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1117',
        card: '#1a1d27',
        border: '#2a2d3e',
      },
    },
  },
  plugins: [],
};

export default config;
