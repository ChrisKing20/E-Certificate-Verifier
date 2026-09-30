import React, { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileCheck, Upload, QrCode, ArrowRight } from 'lucide-react';

export const VerifyCentralPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const certificateId = searchParams.get('certificate') || searchParams.get('id');
    if (certificateId) {
      navigate(`/verify/qr?certificate=${encodeURIComponent(certificateId)}`, { replace: true });
    }
  }, [searchParams, navigate]);
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 w-full">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-heading font-display">
            Verify a Certificate
          </h1>
          <p className="text-secondary-text text-base max-w-lg mx-auto">
            Choose how you want to verify the certificate.
          </p>
        </div>

        {/* Three Large Verification Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Option 1: Certificate Number */}
          <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                <FileCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-display">
                Verify by Certificate Number
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Enter the unique certificate number.
              </p>
            </div>

            <Link
              to="/verify/number"
              className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg border border-[#F59E0B]/30"
            >
              Verify Certificate <ArrowRight className="w-4 h-4 text-[#0A192F]" />
            </Link>
          </div>

          {/* Option 2: Verify by PDF */}
          <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-display">
                Verify by PDF
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Upload the original digital certificate.
              </p>
            </div>

            <Link
              to="/verify/pdf"
              className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg border border-[#F59E0B]/30"
            >
              Upload Certificate <ArrowRight className="w-4 h-4 text-[#0A192F]" />
            </Link>
          </div>

          {/* Option 3: Verify by QR Code */}
          <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                <QrCode className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-display">
                Verify by QR Code
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Scan the QR code printed on the certificate.
              </p>
            </div>

            <Link
              to="/verify/qr"
              className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg border border-[#F59E0B]/30"
            >
              Scan QR Code <ArrowRight className="w-4 h-4 text-[#0A192F]" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
