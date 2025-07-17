/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced primary colors
        'primary-navy': 'var(--primary-navy)',
        'primary-navy-light': 'var(--primary-navy-light)',
        'primary-navy-dark': 'var(--primary-navy-dark)',
        'primary-blue': 'var(--primary-blue)',
        'primary-blue-light': 'var(--primary-blue-light)',
        'primary-blue-dark': 'var(--primary-blue-dark)',
        
        // Enhanced accent colors
        'accent-gold': 'var(--accent-gold)',
        'accent-gold-light': 'var(--accent-gold-light)',
        'accent-gold-dark': 'var(--accent-gold-dark)',
        
        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        
        // Background colors
        'background-primary': 'var(--background-primary)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        
        // Border colors
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        
        // Status colors
        'success': 'var(--success)',
        'success-light': 'var(--success-light)',
        'warning': 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        'error': 'var(--error)',
        'error-light': 'var(--error-light)',
        'info': 'var(--info)',
        'info-light': 'var(--info-light)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        'times': ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'touch': '44px', // iOS recommended minimum touch target
        'screen-90': '90vh',
      },
      minWidth: {
        'touch': '44px', // iOS recommended minimum touch target
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.4' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      backgroundImage: {
        'gradient-blue': 'var(--gradient-blue)',
        'gradient-navy': 'var(--gradient-navy)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-warning': 'var(--gradient-warning)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Mobile-first breakpoints
      'mobile': {'max': '639px'},
      'tablet': {'min': '640px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
      // Touch device optimization
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};