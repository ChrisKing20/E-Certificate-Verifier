import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, Lock, Home, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#1E293B] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" variant="dark" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-[#1E3A8A]/40 text-[#38BDF8] border border-[#3B82F6]/30'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#112240]'
              }`}
            >
              <Home className="w-4 h-4 text-[#F59E0B]" /> Home
            </Link>

            <Link
              to="/verify"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive('/verify')
                  ? 'bg-[#1E3A8A]/40 text-[#38BDF8] border border-[#3B82F6]/30'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#112240]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" /> Verify Certificate
            </Link>
          </nav>

          {/* Right Action: Admin Login & Verify Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E293B] text-sm font-bold text-white bg-[#112240] hover:bg-[#1D2D50] hover:border-[#3B82F6]/50 transition-all shadow-2xs"
            >
              <Lock className="w-4 h-4 text-[#F59E0B]" /> Admin Portal
            </Link>
            
            <Link
              to="/verify"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] text-sm font-extrabold transition-all shadow-md active:scale-95 border border-[#F59E0B]/30"
            >
              Verify Now <ArrowRight className="w-4 h-4 text-[#0A192F]" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-white hover:bg-[#112240] focus:outline-none border border-[#1E293B]"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A192F] border-b border-[#1E293B] px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${
              isActive('/') && location.pathname === '/'
                ? 'bg-[#1E3A8A]/40 text-[#38BDF8]'
                : 'text-white hover:bg-[#112240]'
            }`}
          >
            <Home className="w-5 h-5 text-[#F59E0B]" /> Home
          </Link>

          <Link
            to="/verify"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${
              isActive('/verify')
                ? 'bg-[#1E3A8A]/40 text-[#38BDF8]'
                : 'text-white hover:bg-[#112240]'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-[#38BDF8]" /> Verify Certificate
          </Link>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#1E293B] bg-[#112240] text-sm font-bold text-white"
            >
              <Lock className="w-4 h-4 text-[#F59E0B]" /> Admin Login
            </Link>

            <Link
              to="/verify"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F59E0B] text-[#0A192F] text-sm font-extrabold shadow-md"
            >
              Start Verification <ArrowRight className="w-4 h-4 text-[#0A192F]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
