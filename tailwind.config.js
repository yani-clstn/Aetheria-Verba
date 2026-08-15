/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aetheria: {
          blackberry: '#1A0B1A',
          cardDark: '#120A14',
          beige: '#F5F2EB',
          teal: '#2DD4BF',
          grape: '#3B1F3B',
          dark: '#0B050B',
        },
      },
    },
  },
  plugins: [],
}