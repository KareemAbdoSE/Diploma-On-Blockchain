// src/components/WalletConnection.tsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletConnection: React.FC = () => {
  const { connectWallet, disconnectWallet, account, connected } = useWallet();

  const shortenAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <div>
      {connected && account ? (
        <div>
          <p>Connected Account: {shortenAddress(account)}</p>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnection;
