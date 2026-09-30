import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VerificationResultComponent } from '../components/VerificationResult';
import { VerificationResultData } from '../types';
import { verifyCertificateByNumberApi } from '../services/verificationApi';
import { FileCheck, Search, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export const VerifyNumberPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certNumber, setCertNumber] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResultData | null>(null);

  // Auto-verify if certificate parameter is present in URL
  useEffect(() => {
    const paramId = searchParams.get('id') || searchParams.get('certificate');
    if (paramId) {
      setCertNumber(paramId);
      executeVerification(paramId);
    }
  }, [searchParams]);

  const executeVerification = async (code: string) => {
    setValidationError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await verifyCertificateByNumberApi(code);
      setResult(res);
    } catch (err: any) {
      setValidationError(err.message || 'Verification failed. Please check the certificate number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certNumber.trim();

    if (!trimmed) {
      setValidationError('Please enter a certificate number.');
      setResult(null);
      return;
    }

    executeVerification(trimmed);
  };

  const handleReset = () => {
    setResult(null);
    setCertNumber('');
    setValidationError(null);
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
            <FileCheck className="w-8 h-8 text-primary-teal" /> Verify by Certificate Number
          </h1>
          <p className="text-sm text-secondary-text">
            Enter the unique certificate ID (e.g. ECV-2026-001245) issued by the academic institution.
          </p>
        </div>

        {/* Verification Result Display */}
        {result ? (
          <VerificationResultComponent result={result} onReset={handleReset} />
        ) : (
          <div className="bg-[#112240] p-8 rounded-3xl border border-[#1E293B] shadow-lg space-y-6">
            
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white block">
                  Certificate Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => {
                      setCertNumber(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="ECV-2026-001245"
                    className="w-full px-5 py-4 bg-[#0A192F] rounded-2xl border-2 border-[#1E293B] focus:border-[#3B82F6] text-white font-mono text-lg font-bold placeholder:text-[#64748B] focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer border border-[#F59E0B]/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0A192F]" />
                        Checking database...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-[#0A192F]" /> Verify Certificate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation error message */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </div>
              )}
            </form>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
