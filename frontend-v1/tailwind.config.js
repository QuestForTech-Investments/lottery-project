export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#51CBCE',
          dark: '#1a1a1a',
          light: '#6BD098'
        },
        secondary: {
          DEFAULT: '#66615B',
          light: '#E8E5E0'
        }
      }
    },
  },
  plugins: [],
}
