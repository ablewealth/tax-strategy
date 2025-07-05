/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#c1e0fd',
          300: '#a2d1fc',
          400: '#64b5f9',
          500: '#269af2',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        secondary: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fda49b',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'interactive': '0 0 0 3px rgba(59, 130, 246, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ],
  safelist: [
    'bg-blue-50',
    'bg-blue-600',
    'text-blue-600',
    'text-blue-200',
    'border-blue-300',
    'bg-green-50',
    'text-green-800',
    'bg-yellow-50',
    'text-yellow-800',
    'bg-red-50',
    'text-red-800'
  ]
}
