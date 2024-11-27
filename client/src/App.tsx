// src/App.tsx
import React from 'react';
import WalletConnection from './components/WalletConnection';
import CheckoutForm from './components/CheckoutForm';

const App: React.FC = () => {
  return (
    <div>
      <h1>Diploma Verification Platform</h1>
      <WalletConnection />
      {/* Other components */}
      <CheckoutForm />
    </div>
  );
};

export default App;
