/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#f6f8fb',
          DEFAULT: '#f6f8fb',
          dark: '#081724',
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#ffffff',
          muted: '#f1f5f9',
          dark: '#102233',
          elevated: '#162b3f',
          subtle: '#0d1d2c',
        },
        primary: {
          50: '#eefcf8',
          100: '#d5f8ef',
          200: '#afeedf',
          300: '#7cdecb',
          400: '#47cbb8',
          500: '#20bfb0',
          600: '#169f93',
          700: '#178378',
          800: '#186960',
          900: '#185650',
          950: '#0d3230',
        },
        accent: {
          50: '#fff3f1',
          100: '#ffe2dd',
          200: '#ffc7be',
          300: '#ffa194',
          400: '#ff7867',
          500: '#ff6150',
          600: '#ec4635',
          700: '#c6382b',
          800: '#a33228',
          900: '#873129',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
        'soft-dark': '0 18px 45px rgba(0, 0, 0, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
