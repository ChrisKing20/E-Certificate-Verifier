import React, { useState } from 'react';
import { Certificate } from '../types';
import { useBlockchain } from '../hooks/useBlockchain';
import { registerCertificateOnChain } from '../services/blockchainApi';
import { updateBlockchainMetadataApi } from '../services/certificateApi';
import { DEFAULT_CONTRACT_ADDRESS } from '../config/blockchain';
import { BlockchainStatusBadge } from './BlockchainStatus';
import {
  ShieldCheck,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { getSepoliaExplorerTxUrl } from '../config/blockchain';

interface BlockchainRegistrationProps {
  certificate: Certificate;
  onUpdateSuccess?: (updatedCert: Certificate) => void;
}

export const BlockchainRegistration: React.FC<BlockchainRegistrationProps> = ({
  certificate,
  onUpdateSuccess,
}) => {
  const {
    account,
    isConnected,
    isCorrectNetwork,
    isMetaMaskAvailable,
    connectWallet,
    switchNetwork,
  } = useBlockchain();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentCert, setCurrentCert] = useState<Certificate>(certificate);

  const certId = currentCert.certificateId || currentCert.certificateNumber || '';
  const fileHash = currentCert.fileHash;
  const status = currentCert.blockchainStatus || 'NOT_REGISTERED';

  const handleRegisterOnChain = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Connect wallet if not connected
      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWallet();
        if (!currentAccount) {
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Ensure network is Sepolia
      if (!isCorrectNetwork) {
        const switched = await switchNetwork();
        if (!switched) {
          setErrorMessage('Please switch MetaMask network to Ethereum Sepolia Testnet.');
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Mark backend state as PENDING
      try {
        await updateBlockchainMetadataApi(certId, {
          status: 'PENDING',
          network: 'Ethereum Sepolia',
          contractAddress: DEFAULT_CONTRACT_ADDRESS,
          issuerAddress: currentAccount,
        });
        setCurrentCert((prev) => ({ ...prev, blockchainStatus: 'PENDING' }));
      } catch (_e) {}

      // 4. Trigger MetaMask transaction
      const result = await registerCertificateOnChain(
        DEFAULT_CONTRACT_ADDRESS,
        certId,
        fileHash
      );

      if (!result.success || !result.transactionHash) {
        // Handle failure/rejection
        const failStatus = 'FAILED';
        setErrorMessage(result.error || 'Blockchain transaction was cancelled or reverted.');

        try {
          const updated = await updateBlockchainMetadataApi(certId, {
            status: failStatus,
          });
          if (updated.success && updated.certificate) {
            setCurrentCert(updated.certificate);
            onUpdateSuccess?.(updated.certificate);
          }
        } catch (_e) {}
        return;
      }

      // 5. Transaction Confirmed! Update backend to CONFIRMED
      const confirmRes = await updateBlockchainMetadataApi(certId, {
        status: 'CONFIRMED',
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        network: result.network || 'Ethereum Sepolia',
        contractAddress: result.contractAddress || DEFAULT_CONTRACT_ADDRESS,
        blockchainHash: result.bytes32Hash,
        issuerAddress: result.issuerAddress,
      });

      if (confirmRes.success && confirmRes.certificate) {
        setCurrentCert(confirmRes.certificate);
        onUpdateSuccess?.(confirmRes.certificate);
      } else {
        setCurrentCert((prev) => ({
          ...prev,
          blockchainStatus: 'CONFIRMED',
          blockchainTransactionId: result.transactionHash || null,
          blockchainBlockNumber: result.blockNumber || null,
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during blockchain registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#112240] border border-[#233554] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Ethereum Sepolia Registration</h4>
            <p className="text-xs text-slate-400">Browser-based MetaMask Certificate Signing</p>
          </div>
        </div>
        <BlockchainStatusBadge status={status} />
      </div>

      <div className="bg-[#0A192F] p-3.5 rounded-xl border border-[#233554]/60 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">Certificate ID:</span>
          <span className="font-mono font-medium text-amber-400">{certId}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400">SHA-256 PDF Hash:</span>
          <span className="font-mono text-slate-300 truncate max-w-[200px]" title={fileHash}>
            {fileHash.slice(0, 10)}...{fileHash.slice(-8)}
          </span>
        </div>
        {currentCert.blockchainTransactionId && (
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Transaction:</span>
            <a
              href={getSepoliaExplorerTxUrl(currentCert.blockchainTransactionId)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              <span>{currentCert.blockchainTransactionId.slice(0, 8)}...{currentCert.blockchainTransactionId.slice(-6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {currentCert.blockchainBlockNumber && (
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Block Number:</span>
            <span className="font-mono text-emerald-400 font-semibold">#{currentCert.blockchainBlockNumber}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status !== 'CONFIRMED' && status !== 'REVOKED' && (
        <div className="pt-2">
          {!isMetaMaskAvailable ? (
            <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-center">
              MetaMask is required to sign blockchain transactions. Please install MetaMask.
            </div>
          ) : (
            <button
              onClick={handleRegisterOnChain}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#38BDF8] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>MetaMask Transaction Pending...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Register on Ethereum Sepolia (MetaMask)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {status === 'CONFIRMED' && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Blockchain Integrity Confirmed on Ethereum Sepolia</span>
        </div>
      )}
    </div>
  );
};
