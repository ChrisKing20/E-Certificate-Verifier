import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Home, Menu, X, ArrowRight, User, LogOut, Building2, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

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

            {isAuthenticated && user?.role === 'USER' && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#1E3A8A]/40 text-[#38BDF8] border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#112240]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" /> My Credentials
              </Link>
            )}

            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive('/admin/dashboard')
                    ? 'bg-[#1E3A8A]/40 text-[#38BDF8] border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#112240]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Institution Console
              </Link>
            )}

            {isAuthenticated && user?.role === 'SUPER_ADMIN' && (
              <Link
                to="/superadmin/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive('/superadmin/dashboard')
                    ? 'bg-[#1E3A8A]/40 text-[#38BDF8] border border-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#112240]'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" /> Super Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#112240] border border-slate-800 text-xs font-medium text-slate-300">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all border border-slate-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#112240] transition-all"
                >
                  <User className="w-4 h-4 text-cyan-400" /> Student Login
                </Link>

                <Link
                  to="/register-institution"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1E293B] text-xs font-bold text-slate-200 bg-[#112240] hover:bg-[#1D2D50] hover:border-amber-500/30 transition-all"
                >
                  <Building2 className="w-4 h-4 text-[#F59E0B]" /> Register Institution
                </Link>

                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1E293B] text-xs font-bold text-white bg-[#112240] hover:bg-[#1D2D50] transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Admin
                </Link>
              </>
            )}

            <Link
              to="/verify"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] text-xs font-extrabold transition-all shadow-md active:scale-95 border border-[#F59E0B]/30"
            >
              Verify <ArrowRight className="w-4 h-4 text-[#0A192F]" />
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

          {isAuthenticated ? (
            <>
              {user?.role === 'USER' && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-white hover:bg-[#112240]"
                >
                  <LayoutDashboard className="w-5 h-5 text-emerald-400" /> My Credentials
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-white hover:bg-[#112240]"
                >
                  <LayoutDashboard className="w-5 h-5 text-cyan-400" /> Admin Console
                </Link>
              )}
              {user?.role === 'SUPER_ADMIN' && (
                <Link
                  to="/superadmin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-white hover:bg-[#112240]"
                >
                  <Building2 className="w-5 h-5 text-amber-400" /> Super Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold"
              >
                <LogOut className="w-4 h-4" /> Logout ({user?.name})
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#1E293B] bg-[#112240] text-sm font-bold text-white"
              >
                <User className="w-4 h-4 text-cyan-400" /> Student Login
              </Link>
              <Link
                to="/register-institution"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#1E293B] bg-[#112240] text-sm font-bold text-amber-400"
              >
                <Building2 className="w-4 h-4" /> Register Institution
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#1E293B] bg-[#112240] text-sm font-bold text-white"
              >
                <Lock className="w-4 h-4 text-cyan-400" /> Admin Login
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

