import React, { useState } from 'react';

const SelectField = React.memo(({ label, value, onChange, children }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full h-12 sm:h-14 px-4 appearance-none border rounded-lg text-base bg-white transition-all duration-200
            ${
              isFocused
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
            touch-manipulation pr-10`}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default SelectField;
