import React from 'react';

const Section = React.memo(({ title, description, children }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 sm:px-6 lg:px-8 py-5 lg:py-6 bg-gradient-to-r from-gray-50 to-white">
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-3">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mt-1.5">{description}</p>
    </div>
    <div className="p-5 sm:p-6 lg:p-8">{children}</div>
  </div>
));

export default Section;
