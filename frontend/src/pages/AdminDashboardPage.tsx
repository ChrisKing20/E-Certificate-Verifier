import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { Certificate } from '../types';
import { getDashboardStatsApi, DashboardStats, retryBlockchainRegistrationApi } from '../services/adminApi';
import { getCertificatesApi, createCertificateApi, revokeCertificateApi } from '../services/certificateApi';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  Loader2,
  X,
  Check,
  FolderOpen
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    validCertificates: 0,
    revokedCertificates: 0,
    totalVerifications: 0,
    invalidAttempts: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'REVOKED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Issue Certificate Modal States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueRecipientName, setIssueRecipientName] = useState('');
  const [issueRecipientEmail, setIssueRecipientEmail] = useState('');
  const [issueEventName, setIssueEventName] = useState('');
  const [issueEventDate, setIssueEventDate] = useState('');
  const [issueDepartment, setIssueDepartment] = useState('');
  const [issueCertificateType, setIssueCertificateType] = useState('Certificate of Achievement');
  const [issuePdfFile, setIssuePdfFile] = useState<File | null>(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedSuccessResult, setIssuedSuccessResult] = useState<any | null>(null);

  // Revoke Modal States
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);

  // Auth Protection Check & Fetch Backend Data
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('ecv_admin_logged_in') === 'true' || !!sessionStorage.getItem('ecv_token');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await getDashboardStatsApi();
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      const certsRes = await getCertificatesApi({ search: searchQuery, status: statusFilter });
      if (certsRes.success && certsRes.data) {
        setCertificates(certsRes.data);
      }
    } catch (err) {
      console.log('Unable to query database or fetch dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery, statusFilter]);

  const adminEmail = sessionStorage.getItem('ecv_admin_email') || 'admin@ecertificate.local';

  // Handle Issue Form Submit
  const handleIssueCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError(null);

    if (!issuePdfFile) {
      setIssueError('Please select a valid PDF certificate document.');
      return;
    }

    setIssueSubmitting(true);

    try {
      const res = await createCertificateApi({
        recipientName: issueRecipientName,
        recipientEmail: issueRecipientEmail,
        eventName: issueEventName,
        eventDate: issueEventDate,
        department: issueDepartment,
        certificateType: issueCertificateType,
        file: issuePdfFile,
      });

      if (res.success) {
        setIssuedSuccessResult(res);
        fetchDashboardData();
      }
    } catch (err: any) {
      setIssueError(err.message || 'Failed to issue certificate on database.');
    } finally {
      setIssueSubmitting(false);
    }
  };

  // Handle Revoke Submit
  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeTarget) return;

    setRevokeSubmitting(true);
    try {
      const targetId = revokeTarget.certificateId || revokeTarget.certificateNumber || '';
      await revokeCertificateApi(targetId, revokeReason);
      setRevokeTarget(null);
      setRevokeReason('');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke certificate.');
    } finally {
      setRevokeSubmitting(false);
    }
  };

  const handleCloseIssueModal = () => {
    setShowIssueModal(false);
    setIssuedSuccessResult(null);
    setIssueRecipientName('');
    setIssueRecipientEmail('');
    setIssueEventName('');
    setIssueEventDate('');
    setIssueDepartment('');
    setIssuePdfFile(null);
    setIssueError(null);
  };

  return (
    <div className="min-h-screen flex bg-page-bg">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-bold text-xs border border-[#F59E0B]/30">
                Institutional Admin Workspace
              </span>
              <span className="text-xs text-secondary-text font-mono">{adminEmail}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-heading font-display">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowIssueModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#F59E0B]/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" /> Issue New Certificate
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Certificates"
            value={stats.totalCertificates.toLocaleString()}
            subtitle="Issued academic credentials"
            icon={FileCheck}
            color="primary"
          />

          <DashboardCard
            title="Valid Certificates"
            value={stats.validCertificates.toLocaleString()}
            subtitle="Active valid certificates"
            icon={CheckCircle2}
            color="success"
          />

          <DashboardCard
            title="Revoked Certificates"
            value={stats.revokedCertificates.toLocaleString()}
            subtitle="Flagged or invalidated"
            icon={AlertTriangle}
            color="danger"
          />

          <DashboardCard
            title="Verification Queries"
            value={stats.totalVerifications.toLocaleString()}
            subtitle="Public verification attempts"
            icon={History}
            color="neutral"
          />
        </div>

        {/* CERTIFICATES REGISTRY TABLE SECTION */}
        <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-heading">
                Institutional Certificates Registry
              </h3>
              <p className="text-xs text-secondary-text">
                Manage real certificate records, view verification status, and flag revoked credentials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search bar */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-page-bg rounded-xl border border-border text-xs font-semibold text-heading focus:outline-none focus:border-primary-teal"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-page-bg p-1 rounded-xl border border-border text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-primary-teal text-white'
                      : 'text-secondary-text hover:text-heading'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('VALID')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'VALID'
                      ? 'bg-success text-white'
                      : 'text-secondary-text hover:text-heading'
                  }`}
                >
                  Valid
                </button>
                <button
                  onClick={() => setStatusFilter('REVOKED')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'REVOKED'
                      ? 'bg-error text-white'
                      : 'text-secondary-text hover:text-heading'
                  }`}
                >
                  Revoked
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {certificates.length === 0 ? (
            <div className="p-12 text-center space-y-4 rounded-2xl bg-page-bg border border-dashed border-border">
              <FolderOpen className="w-12 h-12 text-secondary-text/50 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-heading">No Certificates Issued Yet</h4>
                <p className="text-xs text-secondary-text max-w-sm mx-auto">
                  Your certificate database registry is currently empty. Click <span className="font-bold text-primary-teal">Issue New Certificate</span> above to register an event certificate.
                </p>
              </div>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-5 py-2.5 bg-primary-teal text-white text-xs font-bold rounded-xl hover:bg-deep-navy transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-gold" /> Issue First Certificate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-heading">
                <thead className="bg-page-bg text-xs font-bold uppercase tracking-wider text-secondary-text border-b border-border">
                  <tr>
                    <th className="py-3.5 px-4">Certificate ID</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Blockchain</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {certificates.map((cert) => {
                    const certNum = cert.certificateId || cert.certificateNumber || '';
                    const recipient = cert.recipientName || cert.studentName || '';

                    return (
                      <tr key={certNum} className="hover:bg-page-bg/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-primary-teal text-xs">
                          {certNum}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-heading">{recipient}</div>
                          {cert.department && (
                            <div className="text-xs text-secondary-text">{cert.department}</div>
                          )}
                        </td>

                        <td className="py-4 px-4 font-semibold text-heading">
                          {cert.eventName}
                        </td>

                        <td className="py-4 px-4 text-xs font-mono text-secondary-text">
                          {cert.eventDate}
                        </td>

                        <td className="py-4 px-4">
                          <StatusBadge status={cert.status} size="sm" />
                        </td>

                        <td className="py-4 px-4 text-xs">
                          <span className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${
                            cert.blockchainStatus === 'CONFIRMED'
                              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                              : cert.blockchainStatus === 'FAILED'
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                              : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                          }`}>
                            {cert.blockchainStatus || 'CONFIRMED'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right space-x-2">
                          {cert.blockchainStatus === 'FAILED' && (
                            <button
                              onClick={async () => {
                                try {
                                  await retryBlockchainRegistrationApi(certNum);
                                  fetchDashboardData();
                                } catch (e: any) {
                                  alert(e.message || 'Retry failed');
                                }
                              }}
                              className="px-2.5 py-1 bg-[#F59E0B]/10 hover:bg-[#F59E0B] text-[#F59E0B] hover:text-slate-950 text-xs font-bold rounded-lg border border-[#F59E0B]/30 transition-all cursor-pointer"
                            >
                              Retry Chain
                            </button>
                          )}

                          <Link
                            to={`/verify/number?id=${encodeURIComponent(certNum)}`}
                            className="px-2.5 py-1 bg-page-bg hover:bg-primary-teal/10 text-primary-teal text-xs font-bold rounded-lg border border-border inline-flex items-center gap-1 transition-all"
                          >
                            Verify <ExternalLink className="w-3 h-3" />
                          </Link>

                          {cert.status === 'VALID' && (
                            <button
                              onClick={() => setRevokeTarget(cert)}
                              className="px-2.5 py-1 bg-error/10 hover:bg-error text-error hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Revoke
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

        {/* Modal for Issue New Certificate Form */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative my-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2 text-primary-teal font-extrabold text-lg">
                  <ShieldCheck className="w-6 h-6" /> Issue Digital Certificate
                </div>
                <button onClick={handleCloseIssueModal} className="text-secondary-text hover:text-heading cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {issuedSuccessResult ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-success/10 border border-success/30 text-success text-xs font-bold flex items-center gap-3">
                    <Check className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="block text-sm font-extrabold">Certificate Issued & Registered!</span>
                      <span className="block font-normal">Saved to MongoDB with SHA-256 hash & QR code.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-page-bg border border-border text-xs space-y-2 font-mono">
                    <div>
                      <span className="text-secondary-text block">Generated Certificate ID:</span>
                      <span className="font-bold text-primary-teal text-sm">{issuedSuccessResult.certificate.certificateId}</span>
                    </div>
                    <div>
                      <span className="text-secondary-text block">Computed SHA-256 Hash:</span>
                      <span className="font-mono text-[11px] text-heading break-all block bg-surface p-2 rounded-lg border border-border">
                        {issuedSuccessResult.certificate.fileHash}
                      </span>
                    </div>
                    {issuedSuccessResult.qrDataUrl && (
                      <div className="pt-2 text-center">
                        <span className="text-secondary-text block mb-1">Generated QR Code:</span>
                        <img src={issuedSuccessResult.qrDataUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-xl border border-border" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCloseIssueModal}
                    className="w-full py-3 bg-primary-teal text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIssueCertificateSubmit} className="space-y-4 text-xs font-semibold">
                  
                  {/* Recipient Name */}
                  <div className="space-y-1">
                    <label className="text-heading block font-bold">Recipient Student Name</label>
                    <input
                      type="text"
                      required
                      value={issueRecipientName}
                      onChange={(e) => setIssueRecipientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                    />
                  </div>

                  {/* Recipient Email */}
                  <div className="space-y-1">
                    <label className="text-heading block font-bold">Recipient Email</label>
                    <input
                      type="email"
                      required
                      value={issueRecipientEmail}
                      onChange={(e) => setIssueRecipientEmail(e.target.value)}
                      placeholder="rahul@student.college.edu"
                      className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                    />
                  </div>

                  {/* Event Name & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-heading block font-bold">Event Name</label>
                      <input
                        type="text"
                        required
                        value={issueEventName}
                        onChange={(e) => setIssueEventName(e.target.value)}
                        placeholder="Blockchain Workshop"
                        className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-heading block font-bold">Event Date</label>
                      <input
                        type="text"
                        required
                        value={issueEventDate}
                        onChange={(e) => setIssueEventDate(e.target.value)}
                        placeholder="14 Sept 2026"
                        className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                      />
                    </div>
                  </div>

                  {/* Department & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-heading block font-bold">Department</label>
                      <input
                        type="text"
                        value={issueDepartment}
                        onChange={(e) => setIssueDepartment(e.target.value)}
                        placeholder="Computer Science"
                        className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-heading block font-bold">Certificate Type</label>
                      <input
                        type="text"
                        value={issueCertificateType}
                        onChange={(e) => setIssueCertificateType(e.target.value)}
                        placeholder="Merit / Participation"
                        className="w-full px-3.5 py-2.5 bg-page-bg rounded-xl border border-border focus:border-primary-teal text-heading"
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-1">
                    <label className="text-heading block font-bold">Upload Certificate PDF Document</label>
                    <input
                      type="file"
                      required
                      accept=".pdf,application/pdf"
                      onChange={(e) => setIssuePdfFile(e.target.files?.[0] || null)}
                      className="w-full px-3.5 py-2 bg-page-bg rounded-xl border border-border text-xs text-heading file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-teal file:text-white"
                    />
                  </div>

                  {issueError && (
                    <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold">
                      {issueError}
                    </div>
                  )}

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCloseIssueModal}
                      className="px-4 py-2 bg-page-bg hover:bg-border text-heading font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={issueSubmitting}
                      className="px-5 py-2 bg-primary-teal hover:bg-deep-navy text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {issueSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-gold" /> Issuing...
                        </>
                      ) : (
                        'Issue & Save Certificate'
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Modal for Revoke Confirmation */}
        {revokeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-surface rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-error font-extrabold text-lg">
                <AlertTriangle className="w-6 h-6" /> Revoke Certificate
              </div>

              <p className="text-xs text-secondary-text">
                Revoking certificate <span className="font-mono font-bold text-heading">{revokeTarget.certificateId || revokeTarget.certificateNumber}</span> will flag it as invalid across all verification channels.
              </p>

              <form onSubmit={handleRevokeSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-heading block mb-1">Revocation Reason</label>
                  <textarea
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Provide official reason for certificate revocation..."
                    className="w-full p-3 bg-page-bg rounded-xl border border-border text-xs text-heading focus:outline-none focus:border-error"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(null)}
                    className="px-4 py-2 bg-page-bg text-heading text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={revokeSubmitting}
                    className="px-5 py-2 bg-error hover:bg-error/90 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {revokeSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Revocation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
