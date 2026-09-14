import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VerificationResultComponent } from '../components/VerificationResult';
import { VerificationResultData } from '../types';
import { verifyCertificateByPdfApi } from '../services/verificationApi';
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const VerifyPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResultData | null>(null);

  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileSelect = (file: File | undefined) => {
    setErrorMsg(null);
    setResult(null);

    if (!file) return;

    // Check format
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Invalid file format. Please upload a PDF certificate file (.pdf).');
      setSelectedFile(null);
      setUploadStatus(null);
      return;
    }

    // Check max size 10MB
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg(`File size exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      setSelectedFile(null);
      setUploadStatus(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('PDF Document loaded ready for SHA-256 fingerprint check.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Call backend PDF verification endpoint
      const res = await verifyCertificateByPdfApi(selectedFile);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing SHA-256 cryptographic verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setErrorMsg(null);
    setResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        
        {/* Back Link */}
        <Link
          to="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-teal hover:text-deep-navy"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Verification Pathways
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-heading font-display flex items-center gap-2">
            <Upload className="w-8 h-8 text-primary-teal" /> Verify by PDF Certificate Document
          </h1>
          <p className="text-sm text-secondary-text">
            Upload the original PDF certificate file for SHA-256 hash comparison against the database. Maximum file size: {MAX_SIZE_MB} MB.
          </p>
        </div>

        {/* Verification Result Display */}
        {result ? (
          <VerificationResultComponent result={result} onReset={handleReset} />
        ) : (
          <div className="bg-[#112240] p-8 rounded-3xl border border-[#1E293B] shadow-lg space-y-6">
            
            {/* Drag and Drop Zone */}
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative flex flex-col items-center justify-center p-10 border-2 border-dashed border-[#1E293B] hover:border-[#3B82F6] rounded-3xl bg-[#0A192F] hover:bg-[#3B82F6]/5 transition-all cursor-pointer group text-center space-y-4"
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                <FileText className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-base font-extrabold text-white block font-display">
                  Drag and drop digital PDF certificate here
                </span>
                <span className="text-xs text-[#94A3B8] block">
                  or <span className="text-[#38BDF8] underline font-bold">browse from your computer</span>
                </span>
              </div>

              <span className="text-[11px] font-bold text-[#94A3B8] bg-[#112240] px-3 py-1 rounded-full border border-[#1E293B]">
                PDF documents only • Maximum {MAX_SIZE_MB} MB
              </span>
            </label>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Selected File Details & Upload Status */}
            {selectedFile && uploadStatus && (
              <div className="p-5 rounded-2xl bg-[#0A192F] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#38BDF8]" />
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        Size: {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready to verify
                  </span>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#F59E0B]/30"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#0A192F]" />
                      Computing SHA-256 Hash & Checking Database...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#0A192F]" /> Compute SHA-256 & Verify PDF
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SHA-256 Architecture Note */}
            <div className="p-4 rounded-2xl bg-page-bg border border-border text-xs text-secondary-text space-y-1">
              <span className="font-bold text-primary-teal flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Cryptographic Verification Architecture
              </span>
              <p className="leading-relaxed">
                The backend computes a 256-bit SHA-256 hash directly from the PDF bytes and matches it against indexed database records. Modifying even a single character in the PDF changes the hash and triggers an instant <strong>HASH_MISMATCH / INVALID</strong> result. Exact genuine copies will match the authentic certificate record.
              </p>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
