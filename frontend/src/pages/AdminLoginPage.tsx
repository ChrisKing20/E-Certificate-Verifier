import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
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

        </div>

      </main>

      <Footer />
    </div>
  );
};
