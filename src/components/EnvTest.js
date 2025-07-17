import React, { useState, useEffect } from 'react';

const EnvTest = () => {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('Connected ✅');
          setError(null);
        } else {
          setBackendStatus('Error ❌');
          setError(`Backend server returned status: ${response.status}`);
        }
      } catch (err) {
        setBackendStatus('Error ❌');
        setError(`Cannot connect to backend: ${err.message}`);
      }
    };
    
    checkBackendConnection();
  }, []);
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Environment Configuration</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Backend Connection:</span>
          <span className={`text-sm font-medium ${backendStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {backendStatus}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Backend URL:</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}
          </span>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          Note: For AI analysis to work, the backend server must be running and properly configured with a valid API key.
        </div>
      </div>
    </div>
  );
};

export default EnvTest;