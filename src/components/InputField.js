import React, { useState, useEffect } from 'react';
import { formatCurrencyForDisplay, parseCurrencyInput } from '../constants';

const InputField = ({ label, value, onChange, placeholder }) => {
  // State for display value is now only for currency fields
  const isCurrencyField = label !== 'Client Name' && label !== 'Income Growth Rate (%)';
  const [displayValue, setDisplayValue] = useState(
    isCurrencyField && value ? formatCurrencyForDisplay(value) : value || ''
  );

  useEffect(() => {
    // This effect now correctly syncs the display value when the external value prop changes.
    if (isCurrencyField) {
      setDisplayValue(value ? formatCurrencyForDisplay(value) : '');
    } else {
      setDisplayValue(value || '');
    }
  }, [value, isCurrencyField]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (isCurrencyField) {
      // For currency fields, update local display for responsiveness
      setDisplayValue(inputValue);
      // Pass the parsed numeric value to the parent
      onChange(parseCurrencyInput(inputValue));
    } else {
      // For non-currency fields, just pass the raw value up
      onChange(inputValue);
    }
  };

  const handleBlur = (e) => {
    // On blur, format currency fields for consistent display
    if (isCurrencyField) {
      const parsedValue = parseCurrencyInput(e.target.value);
      setDisplayValue(formatCurrencyForDisplay(parsedValue));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={isCurrencyField ? displayValue : value} // Use direct prop for non-currency fields
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-12 sm:h-14 px-4 border border-border-secondary rounded-md text-base bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent touch-manipulation"
      />
    </div>
  );
};

export default InputField;
