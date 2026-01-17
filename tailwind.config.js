/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        dark: {
          900: 'rgb(var(--c-dark-900) / <alpha-value>)',
          800: 'rgb(var(--c-dark-800) / <alpha-value>)',
          700: 'rgb(var(--c-dark-700) / <alpha-value>)',
        },
        white: 'rgb(var(--c-white) / <alpha-value>)',
        gray: {
          200: 'rgb(var(--c-gray-200) / <alpha-value>)',
          300: 'rgb(var(--c-gray-300) / <alpha-value>)', 
          400: 'rgb(var(--c-gray-400) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}