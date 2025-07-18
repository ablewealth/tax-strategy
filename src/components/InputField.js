import React, { useState, useEffect } from 'react';
import { formatCurrencyForDisplay, parseCurrencyInput } from '../constants';

const InputField = React.memo(({ label, value, onChange, placeholder }) => {
  // State for display value is now only for currency fields
  const isCurrencyField = label !== 'Client Name' && label !== 'Income Growth Rate (%)';
  const isPercentageField = label === 'Income Growth Rate (%)';

  const [displayValue, setDisplayValue] = useState(
    isCurrencyField && value ? formatCurrencyForDisplay(value) : value || ''
  );
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    // On blur, format currency fields for consistent display
    if (isCurrencyField) {
      const parsedValue = parseCurrencyInput(e.target.value);
      setDisplayValue(formatCurrencyForDisplay(parsedValue));
    }
  };

  // Ensure value is controlled
  const controlledValue = value !== undefined ? value : '';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {label}
      </label>
      <div className={`relative ${isCurrencyField || isPercentageField ? 'input-with-icon' : ''}`}>
        {isCurrencyField && (
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{paddingLeft: '12px'}}>
            <span className="text-gray-400 text-sm font-medium">$</span>
          </div>
        )}
        <input
          type="text"
          value={isCurrencyField ? displayValue : controlledValue} // Use direct prop for non-currency fields
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full h-12 sm:h-14 ${isCurrencyField ? '' : 'px-4'} ${isPercentageField ? 'pr-8' : ''} 
            border rounded-lg text-base bg-white transition-all duration-200
            ${
              isFocused
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
            touch-manipulation`}
          style={isCurrencyField ? {paddingLeft: '32px'} : {}}
        />

        {isPercentageField && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">%</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default InputField;
