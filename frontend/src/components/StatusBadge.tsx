import React from 'react';
import { CertificateStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: CertificateStatus | 'INVALID' | 'NOT_FOUND' | 'HASH_MISMATCH';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-4 py-1.5 text-sm gap-2 font-extrabold'
  };

  if (status === 'VALID') {
    return (
      <span className={`inline-flex items-center rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 uppercase tracking-wider ${sizeClasses[size]}`}>
        <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> VERIFIED
      </span>
    );
  }

  if (status === 'REVOKED') {
    return (
      <span className={`inline-flex items-center rounded-full bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 uppercase tracking-wider ${sizeClasses[size]}`}>
        <AlertTriangle className="w-4 h-4 text-[#DC2626]" /> REVOKED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 uppercase tracking-wider ${sizeClasses[size]}`}>
      <XCircle className="w-4 h-4 text-[#DC2626]" /> INVALID / FAILED
    </span>
  );
};
