import React from 'react';

const EnvTest = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  
  // eslint-disable-next-line no-console
  console.log('EnvTest component:', {
    apiKey,
    apiKeyLength: (apiKey || '').length,
    apiKeyExists: !!apiKey,
    allReactAppEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
  });
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f5f5f5' }}>
      <h3>Environment Variable Test</h3>
      <p><strong>API Key Configured:</strong> {apiKey ? 'YES' : 'NO'}</p>
      <p><strong>API Key Length:</strong> {(apiKey || '').length}</p>
      <p><strong>API Key Preview:</strong> {apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set'}</p>
      <p><strong>All REACT_APP_ vars:</strong> {Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')).join(', ')}</p>
    </div>
  );
};

export default EnvTest;
