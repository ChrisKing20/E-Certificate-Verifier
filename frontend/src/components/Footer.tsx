import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Lock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A192F] text-white border-t border-[#1E293B] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#1E293B]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" variant="dark" />
            <p className="text-[#94A3B8] text-sm max-w-md leading-relaxed">
              Institutional Digital Event Certificate Verification System. Built for academic transparency, credential integrity, and tamper-resistant verification using SHA-256 cryptographic hashing.
            </p>
          </div>

          {/* Verification Pathways */}
          <div className="space-y-3">
            <h4 className="text-[#F59E0B] font-bold text-xs uppercase tracking-wider">
              Verification Portals
            </h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <Link to="/verify/number" className="hover:text-[#F59E0B] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" /> Verify by Certificate ID
                </Link>
              </li>
              <li>
                <Link to="/verify/pdf" className="hover:text-[#F59E0B] transition-colors">
                  Verify by PDF Upload
                </Link>
              </li>
              <li>
                <Link to="/verify/qr" className="hover:text-[#F59E0B] transition-colors">
                  Verify by Camera QR Code
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-[#F59E0B] transition-colors">
                  All Verification Pathways
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Admin */}
          <div className="space-y-3">
            <h4 className="text-[#38BDF8] font-bold text-xs uppercase tracking-wider">
              Institutional Access
            </h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li>
                <Link to="/admin/login" className="hover:text-[#38BDF8] transition-colors inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#38BDF8]" /> Admin Portal Login
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-[#38BDF8] transition-colors">
                  Admin Dashboard (Protected)
                </Link>
              </li>
              <li>
                <span className="text-[#64748B]">Registrar & Academic Affairs</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <div>
            © 2026 E-Certificate Verifier. Academic Digital Credentials Platform.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#64748B]">SHA-256 Verified</span>
            <span className="text-[#64748B]">MongoDB Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
