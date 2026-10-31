/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          primary: '#10243A',       // Deep Navy
          secondary: '#172F49',     // Midnight Blue
          accent: '#13B8C5',        // Professional Cyan
          'accent-blue': '#3B82F6', // Electric Blue
          bg: '#F4F7FB',            // Soft Cool White
          surface: '#FFFFFF',       // Pure White
          text: '#172B3A',          // Dark Navy
          muted: '#64748B',         // Slate Grey
          border: '#DCE5EE',        // Light Blue Grey
          success: '#16A36A',       // Emerald Green
          warning: '#E9A23B',       // Amber
          danger: '#DC4C4C',        // Professional Red
          info: '#3295D6',          // Sky Blue
          // Priority Colors
          p1: '#DC4C4C',
          p2: '#E9A23B',
          p3: '#3295D6',
          p4: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
