import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  connectWallet as monadConnectWallet,
  disconnectWallet as monadDisconnectWallet,
  reconnectWallet,
  getConnectedAccount,
  isWalletInstalled,
  getAccountBalance,
  formatAddress,
} from '../utils/monad';

interface WalletContextType {
  // State
  isConnected: boolean;
  address: string | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  
  // Utilities
  formatAddress: (address: string) => string;
  isWalletAvailable: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletAvailable] = useState(isWalletInstalled());

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      const accountBalance = await getAccountBalance();
      setBalance(accountBalance.mon);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [address]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const result = await monadConnectWallet();
      setIsConnected(true);
      setAddress(result.address);
      setBalance(result.balance);
      
      // Persist connection state
      localStorage.setItem('wallet_connected', 'true');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await monadDisconnectWallet();
      setIsConnected(false);
      setAddress(null);
      setBalance(0);
      setError(null);
      
      // Clear persisted state
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('monad_pay_active_tab');
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }
  }, []);

  // Auto-reconnect on mount if previously connected
  useEffect(() => {
    const attemptReconnect = async () => {
      const wasConnected = localStorage.getItem('wallet_connected') === 'true';
      const storedAccount = localStorage.getItem('monad_connected_account');
      
      if (wasConnected || storedAccount) {
        console.log('🔄 Attempting wallet reconnection...');
        try {
          // First try to get the already connected account
          const connectedAccount = getConnectedAccount();
          if (connectedAccount) {
            console.log('✅ Found connected account:', connectedAccount);
            setIsConnected(true);
            setAddress(connectedAccount);
            await refreshBalance();
            return;
          }
          
          // Try reconnecting via MetaMask
          console.log('🔌 Reconnecting via MetaMask...');
          const result = await reconnectWallet();
          if (result) {
            console.log('✅ Reconnected successfully:', result.address);
            setIsConnected(true);
            setAddress(result.address);
            setBalance(result.balance);
            localStorage.setItem('wallet_connected', 'true');
          } else {
            // Clear stale connection flags
            console.log('⚠️ Could not reconnect, clearing stale data');
            localStorage.removeItem('wallet_connected');
            localStorage.removeItem('monad_connected_account');
          }
        } catch (err) {
          console.error('❌ Failed to reconnect wallet:', err);
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('monad_connected_account');
        }
      }
    };

    attemptReconnect();
  }, [refreshBalance]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (!isWalletAvailable) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        refreshBalance();
      } else {
        disconnect();
      }
    };

    const handleChainChanged = () => {
      // Some wallets emit multiple 'chainChanged' events rapidly which can
      // cause an infinite reload loop. Debounce using sessionStorage so the
      // app reloads at most once within a short window.
      try {
        const last = sessionStorage.getItem('monad_last_chain_change');
        const now = Date.now();
        if (last && now - Number(last) < 3000) {
          console.warn('Ignoring rapid chainChanged event to prevent reload loop');
          return;
        }
        sessionStorage.setItem('monad_last_chain_change', String(now));
      } catch (e) {
        // sessionStorage might not be available in some environments; fall
        // back to a single reload without debouncing.
        console.warn('sessionStorage unavailable, proceeding with reload');
      }

      // Reload once so the app can pick up network/account changes.
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isWalletAvailable, disconnect, refreshBalance]);

  // Refresh balance periodically when connected
  useEffect(() => {
    if (!isConnected || !address) return;

    const intervalId = setInterval(refreshBalance, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [isConnected, address, refreshBalance]);

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalance,
    formatAddress,
    isWalletAvailable,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};

// Re-export for backward compatibility
export { WalletContext };
