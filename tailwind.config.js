/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        police: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          500: '#1d4ed8',
          700: '#1e3a8a',
          800: '#172554',
          900: '#0f172a',
        },
      }
    },
  },
  plugins: [],
}
