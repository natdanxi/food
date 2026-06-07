module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        '2xl': '1536px', // รองรับหน้าจอขนาดใหญ่
        '3xl': '1920px', // รองรับหน้าจอขนาดใหญ่มาก
      },
    },
  },
  plugins: [],
};