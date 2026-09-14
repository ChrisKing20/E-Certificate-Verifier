import React, { useState } from 'react';
import { VerificationResultData } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  User,
  Building,
  Hash,
  RotateCcw,
  ShieldCheck,
  Clock,
  Layers,
  Info
} from 'lucide-react';

interface VerificationResultProps {
  result: VerificationResultData;
  onReset?: () => void;
}

export const VerificationResultComponent: React.FC<VerificationResultProps> = ({
  result,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const { status, certificate, reason, duplicateNotice, verifiedAt } = result;

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const certNumber = certificate?.certificateId || certificate?.certificateNumber || '';
  const recipientName = certificate?.recipientName || certificate?.studentName || '';
  const hashString = certificate?.fileHash || certificate?.hash || '';
  const issuerName = certificate?.issuer || 'Academic Institution';

  // 1. VALID STATE
  if (status === 'VALID' && certificate) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-surface rounded-3xl border-2 border-success/40 p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-success/10 text-success border border-success/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="VALID" size="sm" />
                <span className="text-xs text-secondary-text font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary-teal" /> Verified {verifiedAt}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-heading">
                ✓ Certificate Authenticity Confirmed
              </h3>
              <p className="text-sm font-semibold text-success mt-0.5">
                Verified against MongoDB institutional database.
              </p>
            </div>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-page-bg hover:bg-border/50 text-heading rounded-xl text-xs font-bold border border-border transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Verify Another
            </button>
          )}
        </div>

        {/* Duplicate Submission Notice */}
        {duplicateNotice && (
          <div className="p-4 rounded-2xl bg-primary-teal/10 border border-primary-teal/30 text-xs text-heading flex items-start gap-2.5">
            <Info className="w-4 h-4 text-primary-teal shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-primary-teal block">Authentic Certificate — Previously Verified</span>
              <span className="text-secondary-text">
                An exact copy of this genuine PDF certificate has been verified previously in our log registry.
              </span>
            </div>
          </div>
        )}

        {/* Primary Certificate Info Grid */}
        <div className="p-6 rounded-2xl bg-page-bg border border-border space-y-5">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className="text-xs font-semibold text-primary-teal uppercase tracking-wider block mb-1">
                EVENT CREDENTIAL
              </span>
              <h4 className="text-xl font-extrabold text-heading">
                {certificate.eventName}
              </h4>
              {certificate.certificateType && (
                <p className="text-sm font-bold text-primary-teal mt-0.5">
                  {certificate.certificateType}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] text-secondary-text uppercase tracking-wider block font-semibold">
                Certificate Number
              </span>
              <span className="font-mono text-base font-bold text-heading bg-surface px-3 py-1 rounded-lg border border-border inline-block mt-0.5 shadow-xs">
                {certNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface text-primary-teal border border-border">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-secondary-text block">Recipient Student Name</span>
                <span className="font-bold text-heading">{recipientName}</span>
                {certificate.department && (
                  <span className="text-xs text-secondary-text block">{certificate.department}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface text-primary-teal border border-border">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-secondary-text block">Event Date</span>
                <span className="font-bold text-heading">{certificate.eventDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface text-primary-teal border border-border">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-secondary-text block">Issued By</span>
                <span className="font-bold text-heading">{issuerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface text-primary-teal border border-border">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-secondary-text block">Registry Status</span>
                <span className="font-bold text-success uppercase">VALID & REGISTERED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Details Section */}
        <div className="p-5 rounded-2xl bg-[#0A192F] text-white space-y-5 border border-[#1E293B]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h5 className="font-bold text-sm text-[#F59E0B] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> Cryptographic & Blockchain Fingerprint
            </h5>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Blockchain Immutable Layer
            </span>
          </div>

          {/* SHA-256 Hash */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between text-secondary-text mb-1">
                <span className="flex items-center gap-1.5 text-white/80 font-sans font-semibold">
                  <Hash className="w-3.5 h-3.5 text-[#F59E0B]" /> Canonical SHA-256 Hash:
                </span>
                <button
                  onClick={() => handleCopyHash(hashString)}
                  className="text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer font-sans text-xs"
                >
                  {copied ? <Check className="w-3 h-3 text-[#F59E0B]" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Hash'}
                </button>
              </div>
              <p className="bg-white/5 p-2.5 rounded-xl border border-white/10 break-all text-white font-mono">
                {hashString}
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-sans">
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> MongoDB Record Matched
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> SHA-256 Fingerprint Valid
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Issuer Wallet Authenticated
              </div>
              <div className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Certificate Active & Not Revoked
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="pt-3 border-t border-white/10 text-xs font-sans space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Blockchain Network:</span>
                <span className="font-bold text-[#38BDF8]">
                  {certificate.blockchainNetwork || 'Ethereum Sepolia Testnet (Chain ID 11155111)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Blockchain Status:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-md border text-[11px] ${
                  certificate.blockchainStatus === 'CONFIRMED'
                    ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                    : certificate.blockchainStatus === 'FAILED'
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                    : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                }`}>
                  {certificate.blockchainStatus || 'CONFIRMED'}
                </span>
              </div>

              {certificate.blockchainContractAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Smart Contract:</span>
                  <span className="font-mono text-white/90 text-[11px]">
                    {certificate.blockchainContractAddress.slice(0, 10)}...{certificate.blockchainContractAddress.slice(-8)}
                  </span>
                </div>
              )}

              {certificate.blockchainTransactionId && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white/70">Sepolia Transaction:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${certificate.blockchainTransactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#38BDF8] hover:underline text-[11px] font-bold flex items-center gap-1"
                  >
                    {certificate.blockchainTransactionId.slice(0, 10)}...{certificate.blockchainTransactionId.slice(-6)} ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // 2. REVOKED STATE
  if (status === 'REVOKED') {
    return (
      <div className="w-full max-w-3xl mx-auto bg-surface rounded-3xl border-2 border-error/40 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-error/10 text-error border border-error/30">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="REVOKED" size="sm" />
              </div>
              <h3 className="text-2xl font-extrabold text-heading">
                ! Certificate Revoked
              </h3>
              <p className="text-sm font-medium text-error mt-0.5">
                This certificate is no longer valid.
              </p>
            </div>
          </div>

          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-page-bg hover:bg-border/50 text-heading rounded-xl text-xs font-bold border border-border transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Another
            </button>
          )}
        </div>

        {/* Reason Box */}
        <div className="p-5 rounded-2xl bg-error/10 border border-error/30 space-y-1">
          <span className="text-xs font-bold text-error uppercase tracking-wider block">
            Revocation Details
          </span>
          <p className="text-sm font-semibold text-heading leading-relaxed">
            Reason: {reason || certificate?.revocationReason || 'Certificate was revoked by the issuing authority.'}
          </p>
        </div>

        {certificate && (
          <div className="p-5 rounded-2xl bg-page-bg border border-border space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary-text">Certificate ID</span>
              <span className="font-mono font-bold text-heading">{certNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-text">Student Name</span>
              <span className="font-bold text-heading">{recipientName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-text">Event</span>
              <span className="font-bold text-heading">{certificate.eventName}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. INVALID / NOT_FOUND / HASH_MISMATCH STATE
  return (
    <div className="w-full max-w-3xl mx-auto bg-surface rounded-3xl border-2 border-error/40 p-6 md:p-8 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-error/10 text-error border border-error/30">
            <XCircle className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status="INVALID" size="sm" />
            </div>
            <h3 className="text-2xl font-extrabold text-heading">
              ✕ Verification Failed ({status})
            </h3>
            <p className="text-sm font-medium text-error mt-0.5">
              The provided certificate could not be authenticated.
            </p>
          </div>
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-page-bg hover:bg-border/50 text-heading rounded-xl text-xs font-bold border border-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
      </div>

      {reason && (
        <p className="text-sm text-heading font-medium p-4 rounded-xl bg-page-bg border border-border">
          {reason}
        </p>
      )}

      {/* Possible Reasons List */}
      <div className="p-5 rounded-2xl bg-page-bg border border-border space-y-3">
        <h5 className="font-bold text-sm text-heading uppercase tracking-wider">
          Possible Reasons for Failure:
        </h5>
        <ul className="space-y-2 text-sm text-secondary-text list-disc list-inside">
          <li>Certificate number not found in institution database</li>
          <li>Certificate PDF file has been modified, tampered with, or corrupted</li>
          <li>SHA-256 fingerprint does not match any registered institutional record</li>
          <li>Certificate has not yet been registered by the academic office</li>
        </ul>
      </div>
    </div>
  );
};
