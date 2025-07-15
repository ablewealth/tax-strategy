import React from 'react';

const Section = ({ title, description, children }) => (
  <div className="bg-background-primary rounded-lg shadow-md border border-border-primary overflow-hidden">
    <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 border-b border-border-primary bg-background-secondary">
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-text-primary flex items-center gap-3">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-text-secondary mt-1">{description}</p>
    </div>
    <div className="p-4 sm:p-6 lg:p-8">{children}</div>
  </div>
);

export default Section;
