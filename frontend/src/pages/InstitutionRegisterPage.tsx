import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerInstitutionApi } from '../services/institutionApi';
import { Building2, Mail, Lock, User, Globe, Phone, Code, CheckCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const InstitutionRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionCode: '',
    officialEmail: '',
    phone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerInstitutionApi(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit institution registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A192F] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-[#112240]/90 backdrop-blur-xl p-8 rounded-2xl border border-emerald-500/30 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Your institution onboarding request for <strong className="text-cyan-400">{formData.institutionName}</strong> has been submitted.
            </p>
            <div className="bg-[#0A192F] p-4 rounded-xl border border-amber-500/30 text-left mb-6">
              <div className="flex items-center text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
                <AlertCircle className="w-4 h-4 mr-1.5" /> Status: PENDING APPROVAL
              </div>
              <p className="text-xs text-slate-400">
                A Super Admin will review your institution request. Once approved, your administrator (<span className="text-slate-200">{formData.adminEmail}</span>) will be able to log in and issue certificates.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex justify-center items-center w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm"
            >
              Return to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0A192F] rounded-[14px] flex items-center justify-center">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Register New Institution
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Onboard your university or organization onto the Multi-Tenant Blockchain Verifier Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-[#112240]/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Institution Section */}
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4 flex items-center">
                <Building2 className="w-4 h-4 mr-2" /> Institution Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    required
                    value={formData.institutionName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="e.g. Stanford University"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Code Prefix (Unique) *
                  </label>
                  <input
                    type="text"
                    name="institutionCode"
                    required
                    value={formData.institutionCode}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm uppercase"
                    placeholder="e.g. STANFORD"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    name="officialEmail"
                    required
                    value={formData.officialEmail}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="contact@stanford.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="https://stanford.edu"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center">
                <User className="w-4 h-4 mr-2" /> Primary Administrator Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Admin Full Name *
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    required
                    value={formData.adminName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="Dr. Eleanor Vance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="admin@stanford.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    name="adminPassword"
                    required
                    minLength={6}
                    value={formData.adminPassword}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-[#0A192F] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 hover:from-amber-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#0A192F] disabled:opacity-50 transition-all cursor-pointer group mt-6"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Institution Registration</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800 pt-6">
            Already registered?{' '}
            <Link to="/admin/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
