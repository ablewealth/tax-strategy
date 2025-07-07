import React, { useState, useEffect } from 'react';
import { formatCurrencyForDisplay, parseCurrencyInput } from '../constants';

const InputField = ({ label, value, onChange, placeholder }) => {
    const [displayValue, setDisplayValue] = useState(value ? formatCurrencyForDisplay(value) : '');

    useEffect(() => {
        setDisplayValue(value ? formatCurrencyForDisplay(value) : '');
    }, [value]);

    const handleInputChange = (e) => {
        setDisplayValue(e.target.value);
        onChange(parseCurrencyInput(e.target.value));
    };

    const handleBlur = (e) => {
        const parsedValue = parseCurrencyInput(e.target.value);
        setDisplayValue(formatCurrencyForDisplay(parsedValue));
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">{label}</label>
            <input
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="h-12 sm:h-14 px-4 border border-border-secondary rounded-md text-base bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent touch-manipulation"
            />
        </div>
    );
};

export default InputField;
