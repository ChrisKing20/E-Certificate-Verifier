import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  getInstitutionsApi,
  approveInstitutionApi,
  rejectInstitutionApi,
  suspendInstitutionApi,
} from '../services/institutionApi';
import { getDashboardStatsApi } from '../services/adminApi';
import { Institution } from '../types/auth';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Award,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Clock,
  User,
  Mail,
  Globe,
  Calendar,
  X,
} from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Institution | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Active Tab based on route or user selection
  const isPendingPage = location.pathname.includes('/pending');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'ALL'>(
    isPendingPage ? 'PENDING' : 'ALL'
  );

  useEffect(() => {
    if (location.pathname.includes('/pending')) {
      setActiveTab('PENDING');
    }
  }, [location.pathname]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [instRes, statsRes] = await Promise.all([
        getInstitutionsApi(),
        getDashboardStatsApi(),
      ]);

      if (instRes.success) {
        setInstitutions(instRes.data || (instRes as any).institutions || []);
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
      if (selectedInst && selectedInst._id === id) {
        setSelectedInst(null);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (inst: Institution) => {
    setShowRejectModal(inst);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!showRejectModal) return;
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    const id = showRejectModal._id;
    setActionLoading(id);
    try {
      await rejectInstitutionApi(id, rejectionReason.trim());
      setShowRejectModal(null);
      setRejectionReason('');
      if (selectedInst && selectedInst._id === id) {
        setSelectedInst(null);
      }
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
      inst.officialEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.proposedAdminName && inst.proposedAdminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inst.proposedAdminEmail && inst.proposedAdminEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const pendingCount = institutions.filter((i) => i.status === 'PENDING').length;
  const activeCount = institutions.filter((i) => i.status === 'ACTIVE').length;
  const suspendedCount = institutions.filter((i) => i.status === 'SUSPENDED').length;
  const rejectedCount = institutions.filter((i) => i.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#112240] p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  PLATFORM SUPER ADMIN GOVERNANCE
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                {isPendingPage ? 'Pending Institution Approval Requests' : 'Institution Management Console'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Review institution onboarding applications, verify credentials, and manage multi-tenant system access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center transition-all border border-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs / Routes */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#112240] p-3 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/super-admin/dashboard"
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isPendingPage && activeTab === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                All Institutions ({institutions.length})
              </Link>

              <Link
                to="/super-admin/institutions/pending"
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  isPendingPage || activeTab === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Pending Requests ({pendingCount})
                {pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-[#0A192F] text-[10px] font-extrabold">
                    {pendingCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  navigate('/super-admin/dashboard');
                  setActiveTab('ACTIVE');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isPendingPage && activeTab === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Active Institutions ({activeCount})
              </button>

              <button
                onClick={() => {
                  navigate('/super-admin/dashboard');
                  setActiveTab('REJECTED');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isPendingPage && activeTab === 'REJECTED'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Rejected ({rejectedCount})
              </button>

              <button
                onClick={() => {
                  navigate('/super-admin/dashboard');
                  setActiveTab('SUSPENDED');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isPendingPage && activeTab === 'SUSPENDED'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Suspended ({suspendedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, code, email, admin..."
                className="w-full pl-10 pr-4 py-2 bg-[#0A192F] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Global Metrics Row (shown on Overview) */}
          {!isPendingPage && stats && (
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

          {/* Main Requests Table Card */}
          <div className="bg-[#112240] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  {isPendingPage
                    ? 'Pending Institution Onboarding Requests'
                    : `Institution Directory (${activeTab})`}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isPendingPage
                    ? 'Review proposed administrator details and authorize platform access.'
                    : 'System-wide listing of registered education providers.'}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                Loading institution applications...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl m-6">
                {error}
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                <p className="text-base font-semibold text-slate-200">No institutions found</p>
                <p className="text-xs text-slate-500">
                  {isPendingPage
                    ? 'There are currently no pending institution onboarding requests.'
                    : `No records match status '${activeTab}'.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#0A192F] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6">Institution Details</th>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Official Email</th>
                      <th className="py-4 px-6">Proposed Administrator</th>
                      <th className="py-4 px-6">Registration Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredInstitutions.map((inst) => {
                      const adminName = inst.proposedAdminName || inst.adminName || 'Pending Set Up';
                      const adminEmail = inst.proposedAdminEmail || inst.adminEmail || inst.officialEmail;
                      const isPending = inst.status === 'PENDING';

                      return (
                        <tr key={inst._id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Institution Name & Website */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-white text-sm">{inst.name}</div>
                            {inst.website ? (
                              <a
                                href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-cyan-400 hover:underline font-normal inline-flex items-center gap-1 mt-0.5"
                              >
                                <Globe className="w-3 h-3 text-cyan-400" /> {inst.website}
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-500">No website provided</span>
                            )}
                          </td>

                          {/* Institution Code */}
                          <td className="py-4 px-6 font-mono text-xs text-amber-400 font-extrabold">
                            <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 inline-block">
                              {inst.institutionCode}
                            </span>
                          </td>

                          {/* Official Email */}
                          <td className="py-4 px-6 text-slate-300 text-xs font-mono">
                            {inst.officialEmail}
                          </td>

                          {/* Proposed Administrator */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              {adminName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              {adminEmail}
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="py-4 px-6 text-slate-400 text-xs">
                            <div className="flex items-center gap-1 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            {inst.status === 'ACTIVE' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> ACTIVE
                              </span>
                            )}
                            {inst.status === 'PENDING' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-pulse" /> PENDING
                              </span>
                            )}
                            {inst.status === 'SUSPENDED' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> SUSPENDED
                              </span>
                            )}
                            {inst.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> REJECTED
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            {/* DETAILS button */}
                            <button
                              onClick={() => setSelectedInst(inst)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" /> View Details
                            </button>

                            {/* APPROVE button */}
                            {isPending && (
                              <button
                                onClick={() => handleApprove(inst._id)}
                                disabled={actionLoading === inst._id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md inline-flex items-center gap-1"
                              >
                                {actionLoading === inst._id ? 'Approving...' : 'Approve'}
                              </button>
                            )}

                            {/* REJECT button */}
                            {isPending && (
                              <button
                                onClick={() => handleOpenRejectModal(inst)}
                                disabled={actionLoading === inst._id}
                                className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md inline-flex items-center gap-1"
                              >
                                Reject
                              </button>
                            )}

                            {inst.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleSuspend(inst._id)}
                                disabled={actionLoading === inst._id}
                                className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold rounded-xl border border-purple-500/30 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}

                            {inst.status === 'SUSPENDED' && (
                              <button
                                onClick={() => handleApprove(inst._id)}
                                disabled={actionLoading === inst._id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#112240] rounded-3xl border border-slate-800 max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative text-slate-200">
            <button
              onClick={() => setSelectedInst(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedInst.name}</h3>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  CODE: {selectedInst.institutionCode}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-[#0A192F] p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className="font-bold text-white uppercase">{selectedInst.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Registration Date</span>
                  <span className="font-bold text-white">
                    {selectedInst.createdAt ? new Date(selectedInst.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Official Email</span>
                  <span className="font-mono text-cyan-400">{selectedInst.officialEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Website</span>
                  <span className="font-mono text-cyan-400">{selectedInst.website || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-[#0A192F] p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                  Proposed Administrator
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-bold text-white">{selectedInst.proposedAdminName || selectedInst.adminName || 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-cyan-400">{selectedInst.proposedAdminEmail || selectedInst.adminEmail || selectedInst.officialEmail}</span>
                </div>
              </div>

              {selectedInst.rejectionReason && (
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/30 text-red-300">
                  <span className="font-bold block mb-1">Rejection Reason:</span>
                  <p>{selectedInst.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInst(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>

              {selectedInst.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(selectedInst)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedInst._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#112240] rounded-3xl border border-red-500/40 max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 relative">
            
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="text-lg font-extrabold text-white">Reject Institution Onboarding</h3>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting request for <strong className="text-white">{showRejectModal.name}</strong> ({showRejectModal.institutionCode}). Please provide a clear rejection reason for record-keeping.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Official domain verification failed or missing accreditation credentials..."
                className="w-full p-3 bg-[#0A192F] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReject}
                disabled={actionLoading === showRejectModal._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading === showRejectModal._id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuperAdminDashboardPage;

