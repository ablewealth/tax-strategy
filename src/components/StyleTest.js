import React from 'react';

const StyleTest = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Style Test Component</h2>
      
      <h3 className="text-lg font-semibold mb-2">1. Color System Test</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <div className="bg-primary-navy text-white p-3 rounded">primary-navy</div>
        <div className="bg-primary-blue text-white p-3 rounded">primary-blue</div>
        <div className="bg-accent-gold text-white p-3 rounded">accent-gold</div>
        <div className="bg-success text-white p-3 rounded">success</div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">2. Card Design Test</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h4 className="font-medium mb-2">Standard Card</h4>
          <p className="text-sm text-gray-600">This is a standard card with the new design</p>
        </div>
        
        <div className="card-premium p-4">
          <h4 className="font-medium mb-2">Premium Card</h4>
          <p className="text-sm text-gray-600">This is a premium card with the new design</p>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">3. Input Field Test</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="input-currency">
          <input 
            type="text" 
            placeholder="Enter amount" 
            className="w-full h-14 pl-8 border rounded-lg text-base bg-white"
          />
        </div>
        
        <select className="w-full h-14 px-4 border rounded-lg text-base bg-white">
          <option>Select an option</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">4. Insight Cards Test</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="insight-card success">
          <h4 className="insight-title success">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Strategic Benefit
          </h4>
          <div className="insight-content">
            This is a test benefit insight card with the new styling.
          </div>
        </div>
        
        <div className="insight-card warning">
          <h4 className="insight-title warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Implementation Consideration
          </h4>
          <div className="insight-content">
            This is a test consideration insight card with the new styling.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTest;