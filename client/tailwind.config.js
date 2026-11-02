/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#E9EAE3',
          light: '#F3F2EC',
          deep: '#DEDFD5',
        },
        ink: {
          DEFAULT: '#171B17',
          soft: '#545A51',
          faint: '#63695E',
        },
        line: {
          DEFAULT: '#C6C8BC',
          strong: '#A8AB9E',
        },
        accent: {
          DEFAULT: '#A22027',
          dark: '#7C151B',
          soft: '#F0DEDB',
        },
        forest: {
          DEFAULT: '#24503B',
          soft: '#DDE7DF',
        },
        gold: {
          DEFAULT: '#87651F',
          soft: '#F0E6CC',
        },
        night: {
          DEFAULT: '#17251E',
          light: '#223429',
          line: '#3A4B40',
          ink: '#F1F0E9',
          muted: '#AAB3A8',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
