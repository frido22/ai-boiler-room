/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#121212',
        'accent-blue': '#4a9eff',
      },
    },
  },
  plugins: [],
}
