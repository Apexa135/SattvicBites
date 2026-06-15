/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandNavy: {
          light: '#374853',
          DEFAULT: '#253038',
          dark: '#1b2329',
        },
        brandGreen: {
          light: '#9cb9ce',
          DEFAULT: '#6f8d9d',
          dark: '#556f7c',
        },
        brandSaffron: {
          light: '#dca0b0',
          DEFAULT: '#c67a8f',
          dark: '#ad5a70',
        },
        brandSage: {
          light: '#cce6f4',
          DEFAULT: '#93c5dd',
          dark: '#6aa9cc',
        },
        brandOchre: {
          light: '#ffe5e3',
          DEFAULT: '#ffccc9',
          dark: '#fca5a0',
        },
        brandWarning: {
          light: '#f3eaad',
          DEFAULT: '#e6d480',
          dark: '#d1be5b',
        },
        brandCanvas: '#f2f6f9',
        brandCard: '#ffffff'
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
