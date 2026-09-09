import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          dark: '#1a1a1a',
          gray: '#333333',
          surface: '#ffffff',
          muted: '#f5f5f5',
          accent: '#f97316',
          'accent-dark': '#ea580c',
        },
      },
    },
  },
  plugins: [],
};

export default config;