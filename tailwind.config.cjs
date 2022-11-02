/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': "Inter"
      }
    },
    fontWeight: {
      light: 100,
      normal: 400,
      semibold: 600,
      bold: 700
    }
  },
  plugins: [],
}