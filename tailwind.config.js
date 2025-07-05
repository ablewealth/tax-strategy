/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': 'var(--primary-navy)',
        'primary-blue': 'var(--primary-blue)',
        'accent-gold': 'var(--accent-gold)',
        'accent-gold-light': 'var(--accent-gold-light)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
