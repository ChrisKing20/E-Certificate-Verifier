import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');
    const errParam = searchParams.get('error');

    if (errParam) {
      setError(decodeURIComponent(errParam));
      return;
    }

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        setSessionFromToken(token, user);
        
        if (user.role === 'SUPER_ADMIN') {
          navigate('/superadmin/dashboard');
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError('Failed to parse authentication payload.');
      }
    } else {
      setError('Missing authentication parameters.');
    }
  }, [searchParams, navigate, setSessionFromToken]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A192F] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-[#112240] p-8 rounded-2xl border border-red-500/30 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Authentication Failed</h3>
          <p className="text-sm text-red-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Completing Authentication...</h3>
        <p className="text-sm text-slate-400 mt-1">Verifying credentials and redirecting...</p>
      </div>
    </div>
  );
};
