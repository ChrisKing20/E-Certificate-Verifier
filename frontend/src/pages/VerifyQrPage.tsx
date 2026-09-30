import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { VerificationResultComponent } from '../components/VerificationResult';
import { VerificationResultData } from '../types';
import { verifyCertificateByNumberApi } from '../services/verificationApi';
import {
  QrCode,
  Camera,
  Loader2,
  ArrowLeft,
  FileCheck,
  Upload,
  AlertCircle,
  StopCircle
} from 'lucide-react';

export const VerifyQrPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResultData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Auto-verify if scanned QR URL carries certificate query param
  useEffect(() => {
    const certificateId = searchParams.get('certificate') || searchParams.get('id');
    if (certificateId) {
      executeVerification(certificateId);
    }
  }, [searchParams]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const stopCameraScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
      } catch (_e) {}
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleStartScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    // Give DOM time to render reader div
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader-video");
        qrScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            stopCameraScanner();
            extractAndVerify(decodedText);
          },
          () => {
            // Frame parsing error ignored
          }
        );
      } catch (err: any) {
        console.error("Camera scanner error:", err);
        setIsScanning(false);
        setCameraError(
          err.message || 'Unable to access camera. Please allow camera permissions or upload a QR code image below.'
        );
      }
    }, 100);
  };

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsLoading(true);

    try {
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      extractAndVerify(decodedText);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setCameraError('Could not detect a valid QR code in the uploaded image. Please ensure the QR image is clear and unblurred.');
    }
  };

  const extractAndVerify = (scannedText: string) => {
    let certId = scannedText.trim();
    try {
      if (certId.startsWith('http://') || certId.startsWith('https://')) {
        const url = new URL(certId);
        certId = url.searchParams.get('certificate') || url.searchParams.get('id') || certId.split('/').pop() || certId;
      }
    } catch (_e) {}

    executeVerification(certId);
  };

  const executeVerification = async (code: string) => {
    stopCameraScanner();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await verifyCertificateByNumberApi(code);
      setResult({
        ...res,
        method: 'qr',
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      extractAndVerify(manualInput.trim());
    }
  };

  const handleReset = () => {
    stopCameraScanner();
    setIsLoading(false);
    setResult(null);
    setCameraError(null);
    setManualInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />

      {/* Hidden reader element for file scans */}
      <div id="reader-hidden" className="hidden"></div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        
        {/* Back Link */}
        <Link
          to="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Verification Pathways
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-heading font-display flex items-center gap-2">
            <QrCode className="w-8 h-8 text-[#F59E0B]" /> Verify by QR Code
          </h1>
          <p className="text-sm text-secondary-text">
            Scan the QR code printed on physical/digital certificates using your live camera or upload a QR image file.
          </p>
        </div>

        {/* Verification Result Display */}
        {result ? (
          <VerificationResultComponent result={result} onReset={handleReset} />
        ) : (
          <div className="bg-[#112240] p-6 sm:p-8 rounded-3xl border border-[#1E293B] shadow-xl space-y-8 text-center max-w-2xl mx-auto">
            
            {/* Camera Viewport / Frame */}
            <div className="relative w-full max-w-xs mx-auto aspect-square bg-[#0A192F] rounded-3xl border-4 border-[#112240] flex flex-col items-center justify-center p-4 text-white overflow-hidden shadow-inner">
              
              {/* Corner targeting indicators */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#F59E0B] z-10 pointer-events-none"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#F59E0B] z-10 pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#F59E0B] z-10 pointer-events-none"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#F59E0B] z-10 pointer-events-none"></div>

              {isLoading ? (
                <div className="flex flex-col items-center space-y-3 z-10">
                  <Loader2 className="w-12 h-12 text-[#F59E0B] animate-spin" />
                  <span className="text-xs font-extrabold text-[#F59E0B] font-mono">
                    Querying Database...
                  </span>
                </div>
              ) : isScanning ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div id="reader-video" className="w-full h-full object-cover"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#F59E0B] animate-pulse shadow-lg shadow-[#F59E0B]"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 p-4">
                  <div className="p-4 rounded-2xl bg-[#112240] text-[#F59E0B] border border-[#F59E0B]/30">
                    <Camera className="w-10 h-10" />
                  </div>
                  <p className="text-xs text-[#94A3B8] font-medium px-2">
                    Position the certificate QR code inside the camera frame.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {cameraError && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2 text-left">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {isScanning ? (
                <button
                  onClick={stopCameraScanner}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <StopCircle className="w-4 h-4" /> Stop Camera
                </button>
              ) : (
                <button
                  onClick={handleStartScanner}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#F59E0B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-slate-950" /> Start Camera Scanner
                </button>
              )}

              {/* Upload QR Image File Button */}
              <label className="w-full sm:w-auto px-6 py-3.5 bg-[#0A192F] hover:bg-[#1E293B] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#1E293B] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-[#38BDF8]" /> Upload QR Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Manual QR Text / Code Fallback Input */}
            <div className="pt-4 border-t border-[#1E293B] space-y-3">
              <span className="text-xs text-[#94A3B8] block font-semibold">
                Or paste scanned QR code text / URL:
              </span>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. ECV-2026-001245 or verification URL"
                  className="flex-1 px-4 py-2.5 bg-[#0A192F] rounded-xl border border-[#1E293B] text-xs font-semibold text-white focus:outline-none focus:border-[#F59E0B]"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim() || isLoading}
                  className="px-4 py-2.5 bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Verify Code
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
