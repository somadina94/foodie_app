/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f76707',
          foreground: '#fafafa',
        },
        brand: {
          orange: '#f76707',
          dark: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};
