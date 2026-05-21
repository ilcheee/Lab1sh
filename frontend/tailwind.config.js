module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ubt: {
          primary:   '#337AB7',
          secondary: '#003169',
          accent:    '#F9F7F7',
          text:      '#112D4E',
          border:    '#D8E3EE',
        },
      },
      fontFamily: {
        lato:   ['Lato', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: { ubt: '4px' },
      fontSize: {
        h1: '48px',
        h2: '42px',
        body: '20px',
      },
    },
  },
  plugins: [],
};
