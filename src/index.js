import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './enhanced-styles.css'; // Import the enhanced styles after the main CSS
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
