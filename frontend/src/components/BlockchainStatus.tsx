import React from 'react';
import { BlockchainStatus } from '../types/blockchain';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Box,
} from 'lucide-react';
import { getSepoliaExplorerTxUrl, getSepoliaExplorerBlockUrl } from '../config/blockchain';

interface BlockchainStatusProps {
  status: BlockchainStatus | string;
  transactionHash?: string | null;
  blockNumber?: number | null;
  network?: string | null;
  contractAddress?: string | null;
  compact?: boolean;
}

export const BlockchainStatusBadge: React.FC<{ status: BlockchainStatus | string }> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>BLOCK CREATED</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Transaction Pending</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Registration Failed</span>
        </span>
      );
    case 'REVOKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 border border-red-500/40 text-red-400">
          <XCircle className="w-3.5 h-3.5" />
          <span>REVOKED</span>
        </span>
      );
    case 'NOT_REGISTERED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Not Registered</span>
        </span>
      );
  }
};

export const BlockchainStatusDetails: React.FC<BlockchainStatusProps> = ({
  status,
  transactionHash,
  blockNumber,
  network = 'Ethereum Sepolia',
  contractAddress,
}) => {
  return (
    <div className="bg-[#112240] border border-[#233554] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
          <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
          <span>Blockchain Audit Metadata</span>
        </div>
        <BlockchainStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Network</span>
          <span className="font-mono text-slate-200 font-medium">{network}</span>
        </div>

        {contractAddress && (
          <div>
            <span className="text-slate-400 block mb-0.5">Contract Address</span>
            <span className="font-mono text-slate-200 font-medium truncate block" title={contractAddress}>
              {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
            </span>
          </div>
        )}

        {transactionHash && (
          <div>
            <span className="text-slate-400 block mb-0.5">Transaction Hash</span>
            <a
              href={getSepoliaExplorerTxUrl(transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#38BDF8] font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>{transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {blockNumber && (
          <div>
            <span className="text-slate-400 block mb-0.5">Block Number</span>
            <a
              href={getSepoliaExplorerBlockUrl(blockNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              <Box className="w-3 h-3" />
              <span>#{blockNumber}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
