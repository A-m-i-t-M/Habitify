/*eslint-env node*/
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAF9F6',
        primary: '#4B4F52',
        secondary: '#7C8B84',
        accent: '#6A5D4D',
        'text-primary': '#2E2E2E',
        'text-muted': '#707070',
      },
      fontFamily: {
        sans: ['"Noto Serif JP"', 'system-ui', 'ui-sans-serif'],
        serif: ['"Noto Serif JP"', 'ui-serif', 'Georgia'],
      },
      keyframes: {
        slide: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        slide: 'slide 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
