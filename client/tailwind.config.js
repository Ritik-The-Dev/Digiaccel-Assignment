/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4353E8',
          50: '#F1F3FE',
          100: '#E7EAFC',
          200: '#D8DDFB',
          300: '#BFC6F7',
          400: '#8B97F1',
          500: '#4353E8',
          600: '#3A49D6',
          700: '#2C39AE',
        },
        ink: '#131A2E',
        muted: '#98A2B3',
        line: '#EAECF5',
        surface: '#F7F8FC',
        danger: '#EF5B4C',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -18px rgba(19, 26, 46, 0.25)',
        sheet: '0 -18px 50px -20px rgba(19, 26, 46, 0.35)',
        fab: '0 16px 30px -12px rgba(67, 83, 232, 0.6)',
      },
      keyframes: {
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'sheet-up': 'sheet-up 260ms cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 180ms ease-out',
        'pop-in': 'pop-in 200ms cubic-bezier(0.32, 0.72, 0, 1)',
        'toast-in': 'toast-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
