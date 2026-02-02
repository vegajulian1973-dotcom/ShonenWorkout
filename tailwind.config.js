/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonGreen: '#39FF14',
        neonPurple: '#9D00FF',
        neonBlue: '#00D4FF',
        neonRed: '#FF003C',
      },
    },
  },
  plugins: [],
}