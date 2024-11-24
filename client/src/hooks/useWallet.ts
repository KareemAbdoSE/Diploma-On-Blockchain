// src/hooks/useWallet.ts
import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

// No need to import WalletConnectProvider

// Initialize Web3Modal without providerOptions
let web3Modal: Web3Modal | null = null;

if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true, // Optional
    // No providerOptions needed for MetaMask only
  });
}

export const useWallet = () => {
  const [rawProvider, setRawProvider] = useState<any>(null);
  const [library, setLibrary] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [network, setNetwork] = useState<ethers.providers.Network | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      if (!web3Modal) return;
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      setRawProvider(provider);
      setLibrary(library);
      setChainId(network.chainId);
      setNetwork(network);
      setConnected(true);

      // Subscribe to accounts change
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          // Handle disconnect
          disconnectWallet();
        }
      });

      // Subscribe to chainId change
      provider.on('chainChanged', (chainId: string) => {
        setChainId(Number(chainId));
        window.location.reload();
      });

      // Subscribe to provider disconnection
      provider.on('disconnect', (error: { code: number; message: string }) => {
        console.log('Disconnected:', error.message);
        disconnectWallet();
      });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setError(error.message || 'Wallet connection failed');
    }
  };

  const disconnectWallet = async () => {
    // MetaMask does not support programmatic disconnection
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    setAccount(null);
    setRawProvider(null);
    setLibrary(null);
    setConnected(false);
  };

  // Automatically connect if a provider is cached
  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
    // Cleanup function
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connectWallet,
    disconnectWallet,
    account,
    signature,
    library,
    chainId,
    network,
    error,
    connected,
  };
};
