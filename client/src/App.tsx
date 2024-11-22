// src/App.tsx
import React from 'react';
import WalletConnection from './components/WalletConnection';

const App: React.FC = () => {
  return (
    <div>
      <h1>Diploma Verification Platform</h1>
      <WalletConnection />
      {/* Other components and routes */}
    </div>
  );
};

export default App;
