import React, { useEffect, useState } from 'react';
import {
  getInstitutionsApi,
  approveInstitutionApi,
  rejectInstitutionApi,
  suspendInstitutionApi,
} from '../services/institutionApi';
import { getDashboardStatsApi } from '../services/adminApi';
import { Institution } from '../types/auth';
import { Building2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Award, FileText, Search, RefreshCw, BarChart2, Filter } from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [instRes, statsRes] = await Promise.all([
        getInstitutionsApi(),
        getDashboardStatsApi(),
      ]);

      if (instRes.success) {
        setInstitutions(instRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Super Admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveInstitutionApi(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    setActionLoading(id);
    try {
      await rejectInstitutionApi(id, reason || undefined);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this institution?')) return;
    setActionLoading(id);
    try {
      await suspendInstitutionApi(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Suspension failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesTab = activeTab === 'ALL' || inst.status === activeTab;
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.institutionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.officialEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = institutions.filter((i) => i.status === 'PENDING').length;
  const activeCount = institutions.filter((i) => i.status === 'ACTIVE').length;
  const suspendedCount = institutions.filter((i) => i.status === 'SUSPENDED').length;

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#112240] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                PLATFORM SUPER ADMIN
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Institution Management Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Approve onboarding requests and monitor platform multi-tenant data
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>

        {/* Global Platform Metrics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#112240] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Institutions</span>
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{institutions.length}</div>
              <div className="mt-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{activeCount} Active</span> · <span className="text-amber-400 font-semibold">{pendingCount} Pending</span>
              </div>
            </div>

            <div className="bg-[#112240] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Certificates</span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.totalCertificates || 0}</div>
              <div className="mt-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{stats.validCertificates || 0} Valid</span> · <span className="text-red-400 font-semibold">{stats.revokedCertificates || 0} Revoked</span>
              </div>
            </div>

            <div className="bg-[#112240] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Verifications</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.totalVerifications || 0}</div>
              <div className="mt-2 text-xs text-slate-400">
                <span>{stats.invalidAttempts || 0} Failed Audit Attempts</span>
              </div>
            </div>

            <div className="bg-[#112240] p-6 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">IPFS Stored</span>
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.ipfsCertificates || 0}</div>
              <div className="mt-2 text-xs text-slate-400">
                <span>Decentralized Pinata Storage</span>
              </div>
            </div>
          </div>
        )}

        {/* Institution Onboarding Management Section */}
        <div className="bg-[#112240] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 bg-[#0A192F] p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending Approvals ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setActiveTab('SUSPENDED')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'SUSPENDED'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Suspended ({suspendedCount})
              </button>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Institutions ({institutions.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search institution or code..."
                className="w-full pl-10 pr-4 py-2 bg-[#0A192F] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading institution directory...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-400 text-sm">{error}</div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No institutions found in status <strong className="text-slate-200">{activeTab}</strong>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0A192F] text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Institution</th>
                    <th className="py-4 px-6">Code Prefix</th>
                    <th className="py-4 px-6">Contact Email</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Registered On</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div>{inst.name}</div>
                        {inst.website && (
                          <a
                            href={inst.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-400 hover:underline font-normal"
                          >
                            {inst.website}
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-amber-400 font-bold">
                        {inst.institutionCode}
                      </td>
                      <td className="py-4 px-6 text-slate-300 text-xs">
                        {inst.officialEmail}
                      </td>
                      <td className="py-4 px-6">
                        {inst.status === 'ACTIVE' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                        {inst.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            PENDING APPROVAL
                          </span>
                        )}
                        {inst.status === 'SUSPENDED' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                            SUSPENDED
                          </span>
                        )}
                        {inst.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {inst.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(inst._id)}
                              disabled={actionLoading === inst._id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(inst._id)}
                              disabled={actionLoading === inst._id}
                              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {inst.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleSuspend(inst._id)}
                            disabled={actionLoading === inst._id}
                            className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                        {inst.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleApprove(inst._id)}
                            disabled={actionLoading === inst._id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
