/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#E86A4A',
          500: '#D4421E',
        }
      },
    },
  },
  plugins: [],
}
