import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { initiateGoogleLogin } from '../services/authApi';
import { Lock, Mail, Key, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setErrorMsg('Unable to connect to the server. Please try again.');
      } else {
        setErrorMsg('Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-16 space-y-8 w-full">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-[#1E3A8A]/10 text-[#1E3A8A] border border-[#1E3A8A]/30 w-fit mx-auto">
            <Lock className="w-8 h-8 text-[#D97706]" />
          </div>
          <h1 className="text-3xl font-extrabold text-heading font-display">
            Admin Portal Sign In
          </h1>
          <p className="text-sm font-semibold text-secondary-text">
            Institutional Administrator Access Only.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#112240] p-8 rounded-3xl border-2 border-[#1E293B] shadow-lg space-y-6">
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecertificate.local"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A192F] rounded-xl border border-[#1E293B] focus:border-[#3B82F6] text-white text-sm focus:outline-none placeholder:text-[#64748B]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block font-sans">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#94A3B8] absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0A192F] rounded-xl border border-[#1E293B] focus:border-[#3B82F6] text-white text-sm focus:outline-none placeholder:text-[#64748B]"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A192F] font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#F59E0B]/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A192F]" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 text-[#0A192F]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={() => initiateGoogleLogin('ADMIN')}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-700 rounded-xl shadow-sm bg-[#0A192F] text-sm font-medium text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"
                />
              </svg>
              Admin Sign In with Google
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Note: Google login is restricted to active admins belonging to approved institutions.
            </p>
          </div>


        </div>

      </main>

      <Footer />
    </div>
  );
};
