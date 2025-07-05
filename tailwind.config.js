/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Palette
        'base-900': '#0d1117', // Main background
        'base-800': '#161b22', // Card backgrounds
        'base-700': '#21262d', // Borders, hover backgrounds
        'primary': '#a78bfa',   // Purple for accents, buttons
        'secondary': '#2dd4bf', // Teal for highlights, charts
        'text-main': '#c9d1d9',  // Primary text
        'text-muted': '#8b949e', // Secondary text
      },
      fontFamily: {
        // Using a more modern, readable font
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'focus': '0 0 0 3px rgba(167, 139, 250, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
