import React from 'react';

const SelectField = ({ label, value, onChange, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">{label}</label>
        <select 
            value={value} 
            onChange={onChange} 
            className="h-12 sm:h-14 px-4 border border-border-secondary rounded-md text-base bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent touch-manipulation"
        >
            {children}
        </select>
    </div>
);

export default SelectField;
