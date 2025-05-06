// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//     "./components/**/*.{js,ts,jsx,tsx}"
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
// // tailwind.config.js
// module.exports = {
//   content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       keyframes: {
//         slide: {
//           '0%': { backgroundPosition: '0% 50%' },
//           '50%': { backgroundPosition: '100% 50%' },
//           '100%': { backgroundPosition: '0% 50%' },
//         },
//       },
//       animation: {
//         slide: 'slide 10s ease-in-out infinite',
//       },
//     },
//   },
//   plugins: [],
//   darkMode: 'class',
// };




// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
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
