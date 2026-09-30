import React from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { Wallet, AlertTriangle, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { getSepoliaExplorerAddressUrl } from '../config/blockchain';

export const WalletConnect: React.FC = () => {
  const {
    account,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    isMetaMaskAvailable,
    error,
    connectWallet,
    switchNetwork,
  } = useBlockchain();

  if (!isMetaMaskAvailable) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>MetaMask Extension Required</span>
      </div>
    );
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <div className="flex items-center gap-2">
          {!isCorrectNetwork ? (
            <button
              onClick={switchNetwork}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs hover:bg-red-500/30 transition-all font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Switch to Sepolia</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sepolia</span>
            </div>
          )}

          <a
            href={getSepoliaExplorerAddressUrl(account!)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#112240] border border-[#233554] text-slate-200 text-xs hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all"
            title="View wallet on Sepolia Etherscan"
          >
            <Wallet className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-mono font-medium">{truncateAddress(account!)}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-all text-xs font-semibold disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      )}

      {error && (
        <span className="text-xs text-red-400 hidden md:inline ml-1" title={error}>
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
