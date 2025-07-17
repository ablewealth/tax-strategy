import React from 'react';

const Header = React.memo(({ onPrint, clientName }) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Blue accent line */}
      <div className="h-1 bg-gradient-to-r from-primary-blue to-primary-blue-light"></div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          {/* Logo and Company Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <img
              src="https://ablewealth.com/AWM%20Logo%203.png"
              alt="Able Wealth Management"
              className="h-6 sm:h-8 w-auto"
            />
            <div className="lg:border-l lg:border-gray-300 lg:pl-6">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Advanced Tax Strategy Optimizer
              </h1>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                Professional-grade tax planning & modeling tool
              </p>
            </div>
          </div>

          {/* Client Analysis Info and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="text-left sm:text-right bg-gray-50 p-3 rounded-lg">
              <p className="font-serif text-xs sm:text-sm text-gray-500">Analysis for:</p>
              <p className="font-serif text-base sm:text-lg font-semibold text-gray-900">
                {clientName}
              </p>
              <p className="text-xs text-gray-500 mt-1">{today}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={onPrint}
                className="flex items-center justify-center gap-2 bg-primary-blue hover:bg-primary-blue-dark text-white px-4 sm:px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 w-full sm:w-auto min-h-[44px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 20 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zm4 7a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Header;
