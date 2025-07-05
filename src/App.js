@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-base-900 text-text-main m-0 font-sans;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Customizing form inputs for the new theme */
  .form-input, .form-select {
    @apply bg-base-800 border-base-700 text-text-main rounded-md shadow-sm;
    @apply focus:ring-primary focus:border-primary focus:shadow-focus;
  }
}

/* --- Default Styles --- */
#print-mount {
  display: none;
}

/* --- Print-specific styles --- */
@media print {
  body {
    background-color: #fff;
    color: #000;
  }
  
  .print-hide {
    display: none !important;
  }
  
  #print-mount {
    display: block !important;
  }

  /* ... other print styles remain largely the same, but can be updated if needed ... */
}
