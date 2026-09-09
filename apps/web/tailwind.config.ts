import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
        semantic: {
          success: '#22c55e',
          error: '#ef4444',
          warning: '#eab308',
          info: '#3b82f6',
        },
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-top': 'slideInTop 300ms ease-out',
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'slide-in-bottom': 'slideInBottom 250ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-down': 'scaleDown 100ms ease',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
