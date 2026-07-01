/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"K2D"', '"Sarabun"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
