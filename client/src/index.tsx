// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18
import App from './App';

// Import Buffer and process polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Stripe imports
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make Buffer and process available globally
(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = Buffer;

// Load Stripe using your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

console.log('Stripe Publishable Key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </React.StrictMode>
  );
}
