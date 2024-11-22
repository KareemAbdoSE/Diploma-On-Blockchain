// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Import Buffer and process polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer and process available globally
(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
