import { useEffect } from 'react';

const StyleInjector = () => {
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    
    // Add our enhanced CSS
    styleElement.textContent = `
      /* Enhanced Color System with Gradients */
      :root {
        --primary-navy: #0f172a;
        --primary-navy-light: #1e293b;
        --primary-navy-dark: #0a1122;
        --primary-blue: #1e40af;
        --primary-blue-light: #3b82f6;
        --primary-blue-dark: #1e3a8a;
        
        /* Gradient definitions */
        --gradient-blue: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        --gradient-navy: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        --gradient-gold: linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%);
        --gradient-success: linear-gradient(135deg, #059669 0%, #10b981 100%);
        --gradient-warning: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
      }
      
      /* Premium Header */
      .bg-gradient-to-r {
        background-image: linear-gradient(to right, var(--tw-gradient-stops));
      }
      
      .from-primary-navy {
        --tw-gradient-from: #0f172a;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(15, 23, 42, 0));
      }
      
      .to-primary-navy-light {
        --tw-gradient-to: #1e293b;
      }
      
      /* Modern Card Design */
      .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
        transition: box-shadow 0.25s ease, transform 0.25s ease;
      }
      
      .card:hover {
        box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
      }
      
      /* Enhanced Dashboard Metrics */
      .metric-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
        padding: 1.25rem;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        position: relative;
      }
      
      .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
      }
      
      /* Better Insights */
      .insight-card {
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        position: relative;
        overflow: hidden;
        border: 1px solid transparent;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      
      .insight-card.success {
        background-color: #d1fae5;
        border-color: #059669;
      }
      
      .insight-card.warning {
        background-color: #fef3c7;
        border-color: #d97706;
      }
      
      /* Animation utilities */
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
      
      .animate-slide-up {
        animation: slideUp 0.5s ease-in-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      /* Input Currency */
      .input-currency {
        position: relative;
      }
      
      .input-currency::before {
        content: "$";
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        pointer-events: none;
      }
    `;
    
    // Append the style element to the head
    document.head.appendChild(styleElement);
    
    // Clean up function to remove the style element when the component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default StyleInjector;