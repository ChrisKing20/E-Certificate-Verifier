import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Upload,
  QrCode,
  ArrowRight,
  Layers,
  CheckCircle,
  FileText,
  Search,
  Cpu,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />
      <main className="flex-1 space-y-24 pb-16">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A192F] via-[#0D1F38] to-[#0A192F]">
          <div className="max-w-4xl mx-auto text-center space-y-8">
          
            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] font-display">
              Verify Every Certificate. <br />
              <span className="text-[#F59E0B]">
                Trust Every Achievement.
              </span>
            </h1>
            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed">
              Instantly verify digital event certificates with a secure and tamper-resistant verification system.
            </p>
            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/verify"
                className="px-8 py-4 text-base font-extrabold text-[#0A192F] bg-[#F59E0B] hover:bg-[#D97706] rounded-2xl shadow-xl transition-all duration-200 active:scale-95 flex items-center gap-2 border border-[#F59E0B]/40"
              >
                <ShieldCheck className="w-5 h-5 text-[#0A192F]" /> Verify Certificate
              </Link>

              <Link
                to="/admin/login"
                className="px-8 py-4 text-base font-bold text-white bg-[#112240] hover:bg-[#1D2D50] rounded-2xl border-2 border-[#1E293B] hover:border-[#3B82F6] transition-all duration-200 flex items-center gap-2 shadow-xs"
              >
                <Lock className="w-5 h-5 text-[#F59E0B]" /> Admin Portal
              </Link>
            </div>
          </div>
        </section>
        {/* CONCEPTUAL VERIFICATION FLOW SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl bg-[#112240] border border-[#1E293B] shadow-lg space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest font-sans">
                System Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Verification Flow Pipeline
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              
              <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E293B] text-center space-y-3 relative">
                <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#38BDF8] w-fit mx-auto border border-[#3B82F6]/20">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Certificate</h3>
                <p className="text-xs text-[#94A3B8]">
                  Issued event certificate presented by student or recruiter.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E293B] text-center space-y-3 relative">
                <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#38BDF8] w-fit mx-auto border border-[#3B82F6]/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Digital Fingerprint</h3>
                <p className="text-xs text-[#94A3B8]">
                  Unique 256-bit SHA-256 cryptographic hash calculated.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E293B] text-center space-y-3 relative">
                <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#38BDF8] w-fit mx-auto border border-[#3B82F6]/20">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Verification</h3>
                <p className="text-xs text-[#94A3B8]">
                  Cross-matched against institutional registry records.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0A192F] border border-[#1E293B] text-center space-y-3 relative">
                <div className="p-3 rounded-xl bg-[#10B981]/10 text-[#10B981] w-fit mx-auto border border-[#10B981]/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base font-display">Trusted Result</h3>
                <p className="text-xs text-[#94A3B8]">
                  Instant confirmation of authenticity & credential status.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* THREE WAYS TO VERIFY SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest font-sans">
              Verification Methods
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Three Ways to Verify
            </h2>
            <p className="text-[#94A3B8] text-sm max-w-xl mx-auto">
              Select any of the three secure verification pathways tailored for event credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white font-display">1. Certificate Number</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Enter the unique alphanumeric certificate ID (e.g. <code className="text-[#F59E0B] font-mono font-bold">CERT-2027-001</code>) printed on the credential.
                </p>
              </div>
              <Link
                to="/verify/number"
                className="inline-flex items-center gap-2 font-extrabold text-sm text-[#38BDF8] hover:text-white"
              >
                Verify by Number <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white font-display">2. Upload PDF</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Upload the original digital PDF document. The system identifies document fingerprints for authentication.
                </p>
              </div>
              <Link
                to="/verify/pdf"
                className="inline-flex items-center gap-2 font-extrabold text-sm text-[#38BDF8] hover:text-white"
              >
                Upload PDF <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-[#112240] border-2 border-[#1E293B] hover:border-[#3B82F6] shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1E3A8A]/30 text-[#38BDF8] w-fit group-hover:bg-[#3B82F6] group-hover:text-white transition-colors border border-[#3B82F6]/30">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white font-display">3. Scan QR Code</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Scan the embedded QR code printed on physical or digital certificates for immediate verification.
                </p>
              </div>
              <Link
                to="/verify/qr"
                className="inline-flex items-center gap-2 font-extrabold text-sm text-[#38BDF8] hover:text-white"
              >
                Scan QR Code <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
              </Link>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest font-sans">
              Step-by-Step Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#112240] border border-[#1E293B] space-y-3">
              <span className="text-3xl font-black text-[#F59E0B] font-display">01</span>
              <h4 className="font-extrabold text-white text-base font-display">Upload or enter details</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Provide the certificate ID number, PDF document, or scan the printed QR code.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#112240] border border-[#1E293B] space-y-3">
              <span className="text-3xl font-black text-[#F59E0B] font-display">02</span>
              <h4 className="font-extrabold text-white text-base font-display">System identifies certificate</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                The verification engine searches institutional records for matching metadata.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#112240] border border-[#1E293B] space-y-3">
              <span className="text-3xl font-black text-[#F59E0B] font-display">03</span>
              <h4 className="font-extrabold text-white text-base font-display">Authenticity checked</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Document integrity, revocation status, and signatory credentials are checked.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#112240] border border-[#1E293B] space-y-3">
              <span className="text-3xl font-black text-[#F59E0B] font-display">04</span>
              <h4 className="font-extrabold text-white text-base font-display">Result displayed</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Instant audit result (VALID, INVALID, or REVOKED) displayed with full details.
              </p>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
