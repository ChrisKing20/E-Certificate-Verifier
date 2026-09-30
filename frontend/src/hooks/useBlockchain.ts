import { useState, useEffect, useCallback } from 'react';
import { SEPOLIA_CHAIN_ID } from '../config/blockchain';
import {
  isMetaMaskInstalled,
  connectMetaMask,
  getCurrentNetworkChainId,
  switchToSepoliaNetwork,
} from '../services/blockchainApi';

export interface UseBlockchainReturn {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isMetaMaskAvailable: boolean;
  error: string | null;
  connectWallet: () => Promise<string | null>;
  switchNetwork: () => Promise<boolean>;
}

export const useBlockchain = (): UseBlockchainReturn => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMetaMaskAvailable = isMetaMaskInstalled();
  const isConnected = Boolean(account);
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  // Refresh network chainId and account on mount
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskAvailable) return;

    try {
      const currentChain = await getCurrentNetworkChainId();
      setChainId(currentChain);

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    } catch (_err) {
      // Ignore initial silent errors
    }
  }, [isMetaMaskAvailable]);

  useEffect(() => {
    checkConnection();

    if (isMetaMaskAvailable && window.ethereum.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setError(null);
        } else {
          setAccount(null);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isMetaMaskAvailable, checkConnection]);

  const connectWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    setError(null);
    try {
      const selectedAccount = await connectMetaMask();
      setAccount(selectedAccount);

      const currentChain = await getCurrentNetworkChainId();
      setChainId(currentChain);

      if (currentChain !== SEPOLIA_CHAIN_ID) {
        await switchToSepoliaNetwork();
        const updatedChain = await getCurrentNetworkChainId();
        setChainId(updatedChain);
      }

      return selectedAccount;
    } catch (err: any) {
      setError(err.message || 'Failed to connect MetaMask wallet.');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (): Promise<boolean> => {
    setError(null);
    try {
      const success = await switchToSepoliaNetwork();
      if (success) {
        const updatedChain = await getCurrentNetworkChainId();
        setChainId(updatedChain);
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Failed to switch network.');
      return false;
    }
  };

  return {
    account,
    chainId,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    isMetaMaskAvailable,
    error,
    connectWallet,
    switchNetwork,
  };
};
