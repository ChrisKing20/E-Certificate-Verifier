import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { WalletConnect } from '../components/WalletConnect';
import { BlockchainRegistration } from '../components/BlockchainRegistration';
import { Certificate } from '../types';
import {
  getDashboardStatsApi,
  DashboardStats,
  migrateIpfsApi,
  getVerificationLogsApi
} from '../services/adminApi';
import {
  getCertificatesApi,
  createCertificateApi,
  revokeCertificateApi
} from '../services/certificateApi';
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
  FolderOpen,
  HardDrive,
  RefreshCw,
  Settings as SettingsIcon,
  Cpu,
  Globe,
  Key,
  LogOut,
  Copy,
  CheckCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const activePath = location.pathname;

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    validCertificates: 0,
    revokedCertificates: 0,
    ipfsCertificates: 0,
    localCertificates: 0,
    blockchainConfirmed: 0,
    blockchainFailed: 0,
    totalVerifications: 0,
    invalidAttempts: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'REVOKED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isMigratingIpfs, setIsMigratingIpfs] = useState(false);

  // Verification Logs State
  const [verificationLogs, setVerificationLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

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

  // Blockchain Modal State for specific certificate registration
  const [blockchainRegisterTarget, setBlockchainRegisterTarget] = useState<Certificate | null>(null);

  // Copy Feedback State
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Auth Protection Check & Fetch Backend Data
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('ecv_admin_logged_in') === 'true' || !!sessionStorage.getItem('ecv_token');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (activePath === '/admin/verification-logs') {
      fetchVerificationLogs();
    }
  }, [activePath]);

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

  const fetchVerificationLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await getVerificationLogsApi({ limit: 50 });
      if (res.success && res.logs) {
        setVerificationLogs(res.logs);
      }
    } catch (err) {
      console.log('Failed to fetch verification audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery, statusFilter]);

  const handleMigrateIpfs = async () => {
    if (!window.confirm('Migrate all local certificates to IPFS?')) return;
    setIsMigratingIpfs(true);
    try {
      const res = await migrateIpfsApi();
      if (res.success) {
        alert(`Migration complete! ${res.result?.migratedCount || 0} certificates migrated to IPFS.`);
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'IPFS migration failed.');
    } finally {
      setIsMigratingIpfs(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleLogoutDirect = () => {
    logout();
    navigate('/');
  };

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

  const getPageTitle = () => {
    if (activePath === '/admin/certificates') return 'Certificates Registry';
    if (activePath === '/admin/verification-logs') return 'Verification Audit Logs';
    return 'Dashboard Overview';
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
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleMigrateIpfs}
              disabled={isMigratingIpfs}
              className="px-4 py-2.5 bg-surface hover:bg-page-bg text-heading font-bold text-xs rounded-xl border border-border transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Migrate legacy local files to IPFS"
            >
              {isMigratingIpfs ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-teal" />
              ) : (
                <HardDrive className="w-4 h-4 text-primary-teal" />
              )}
              {isMigratingIpfs ? 'Migrating...' : 'IPFS Migration'}
            </button>

            <WalletConnect />

            <button
              onClick={() => setShowIssueModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#F59E0B]/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" /> Issue New Certificate
            </button>
          </div>
        </div>

        {/* ─── TAB 1: DASHBOARD OVERVIEW ─── */}
        {activePath === '/admin/dashboard' && (
          <div className="space-y-8">
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
                title="IPFS Certificates"
                value={(stats.ipfsCertificates ?? stats.totalCertificates).toLocaleString()}
                subtitle="Decentralized IPFS storage"
                icon={HardDrive}
                color="success"
              />

              <DashboardCard
                title="Blockchain Confirmed"
                value={(stats.blockchainConfirmed ?? 0).toLocaleString()}
                subtitle="Confirmed on Ethereum Sepolia"
                icon={ShieldCheck}
                color="primary"
              />

              <DashboardCard
                title="Verification Queries"
                value={stats.totalVerifications.toLocaleString()}
                subtitle="Public verification attempts"
                icon={History}
                color="neutral"
              />
            </div>

            {/* Quick Actions & Recent Certificates snippet */}
            <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-heading">
                    Recent Issued Certificates
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Overview of latest credentials recorded in institutional MongoDB registry.
                  </p>
                </div>

                <Link
                  to="/admin/certificates"
                  className="px-4 py-2 bg-page-bg hover:bg-primary-teal/10 text-primary-teal font-bold text-xs rounded-xl border border-border transition-all flex items-center gap-1.5"
                >
                  View All Certificates <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-secondary-text space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-teal" />
                  <p className="text-xs font-semibold">Querying records...</p>
                </div>
              ) : certificates.length === 0 ? (
                <div className="py-12 text-center text-secondary-text space-y-3 border-2 border-dashed border-border rounded-2xl">
                  <FolderOpen className="w-10 h-10 mx-auto text-secondary-text/50" />
                  <p className="text-sm font-bold text-heading">No Certificates Issued Yet</p>
                  <p className="text-xs">Click "Issue New Certificate" above to generate your first credential.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-secondary-text">
                        <th className="py-3 px-4">Certificate ID</th>
                        <th className="py-3 px-4">Student Recipient</th>
                        <th className="py-3 px-4">Storage / IPFS</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Blockchain</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs font-medium">
                      {certificates.slice(0, 5).map((cert) => {
                        const certNum = cert.certificateId || cert.certificateNumber || '';
                        const studentName = cert.recipientName || cert.studentName || '';
                        const cid = cert.ipfsCid || cert.ipfsHash || null;

                        return (
                          <tr key={cert.id || cert._id || certNum} className="hover:bg-page-bg/50 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-primary-teal">
                              {certNum}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-heading block">{studentName}</span>
                              <span className="text-[11px] text-secondary-text">{cert.recipientEmail}</span>
                            </td>
                            <td className="py-4 px-4">
                              {cid ? (
                                <a
                                  href={cert.ipfsGatewayUrl && !cert.ipfsGatewayUrl.includes('gateway.pinata.cloud') ? cert.ipfsGatewayUrl : `https://ipfs.io/ipfs/${cid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-[11px] text-heading hover:text-primary-teal font-semibold inline-flex items-center gap-1"
                                >
                                  {cid.slice(0, 8)}...{cid.slice(-4)} <ExternalLink className="w-3 h-3 text-secondary-text" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-secondary-text">Local PDF</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <StatusBadge status={cert.status} size="sm" />
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                cert.blockchainStatus === 'CONFIRMED'
                                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                  : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                              }`}>
                                {cert.blockchainStatus === 'CONFIRMED' ? '🟢 BLOCK CREATED' : 'NOT REGISTERED'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Link
                                to={`/verify/number?id=${encodeURIComponent(certNum)}`}
                                className="px-2.5 py-1 bg-page-bg hover:bg-primary-teal/10 text-primary-teal text-xs font-bold rounded-lg border border-border inline-flex items-center gap-1 transition-all"
                              >
                                Verify <ExternalLink className="w-3 h-3" />
                              </Link>
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
        )}

        {/* ─── TAB 2: CERTIFICATES REGISTRY ─── */}
        {activePath === '/admin/certificates' && (
          <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-heading">
                  Institutional Certificates Registry
                </h3>
                <p className="text-xs text-secondary-text">
                  Manage certificate records, view IPFS CIDs, and register credentials on Ethereum Sepolia.
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
                    placeholder="Search student, ID, or IPFS CID..."
                    className="w-full pl-9 pr-4 py-2 bg-page-bg rounded-xl border border-border text-xs font-semibold text-heading focus:outline-none focus:border-primary-teal"
                  />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 bg-page-bg p-1 rounded-xl border border-border text-xs font-bold">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'ALL'
                        ? 'bg-primary-teal text-white'
                        : 'text-secondary-text hover:text-heading'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('VALID')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'VALID'
                        ? 'bg-success text-white'
                        : 'text-secondary-text hover:text-heading'
                    }`}
                  >
                    Valid
                  </button>
                  <button
                    onClick={() => setStatusFilter('REVOKED')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
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

            {/* Table view */}
            {isLoading ? (
              <div className="py-16 text-center text-secondary-text space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-teal" />
                <p className="text-xs font-semibold">Querying MongoDB institutional records...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="py-16 text-center text-secondary-text space-y-3 border-2 border-dashed border-border rounded-2xl">
                <FolderOpen className="w-10 h-10 mx-auto text-secondary-text/50" />
                <p className="text-sm font-bold text-heading">No Certificates Found</p>
                <p className="text-xs">No records match your active search or status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-secondary-text">
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Student Recipient</th>
                      <th className="py-3 px-4">Storage / IPFS CID</th>
                      <th className="py-3 px-4">SHA-256 Hash</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Blockchain Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium">
                    {certificates.map((cert) => {
                      const certNum = cert.certificateId || cert.certificateNumber || '';
                      const studentName = cert.recipientName || cert.studentName || '';
                      const cid = cert.ipfsCid || cert.ipfsHash || null;
                      const storage = cert.storageType || (cid ? 'IPFS' : 'LOCAL');
                      const fileHash = cert.fileHash || '';

                      return (
                        <tr key={cert.id || cert._id || certNum} className="hover:bg-page-bg/50 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-primary-teal">
                            {certNum}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-heading block">{studentName}</span>
                            <span className="text-[11px] text-secondary-text">{cert.recipientEmail}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded bg-primary-teal/10 text-primary-teal text-[10px] font-bold border border-primary-teal/30 inline-block mb-1">
                              {storage}
                            </span>
                            {cid ? (
                              <a
                                href={cert.ipfsGatewayUrl && !cert.ipfsGatewayUrl.includes('gateway.pinata.cloud') ? cert.ipfsGatewayUrl : `https://ipfs.io/ipfs/${cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-heading hover:text-primary-teal font-semibold flex items-center gap-1 block"
                              >
                                {cid.slice(0, 10)}...{cid.slice(-6)} <ExternalLink className="w-3 h-3 text-secondary-text" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-secondary-text block">Local PDF</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {fileHash ? (
                              <div className="flex items-center gap-1 font-mono text-[11px] text-secondary-text">
                                <span>{fileHash.slice(0, 8)}...{fileHash.slice(-6)}</span>
                                <button
                                  onClick={() => handleCopy(fileHash)}
                                  className="p-1 hover:text-primary-teal cursor-pointer"
                                  title="Copy SHA-256 Hash"
                                >
                                  {copiedHash === fileHash ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-success" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-secondary-text">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={cert.status} size="sm" />
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              cert.blockchainStatus === 'CONFIRMED'
                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                : cert.blockchainStatus === 'FAILED'
                                ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                            }`}>
                              {cert.blockchainStatus === 'CONFIRMED' ? '🟢 BLOCK CREATED' : (cert.blockchainStatus || 'NOT REGISTERED')}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right space-x-2">
                            {cert.blockchainStatus !== 'CONFIRMED' && cert.status === 'VALID' && (
                              <button
                                onClick={() => setBlockchainRegisterTarget(cert)}
                                className="px-2.5 py-1 bg-[#38BDF8]/10 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-slate-950 text-xs font-bold rounded-lg border border-[#38BDF8]/30 transition-all cursor-pointer"
                              >
                                Register Chain
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
        )}

        {/* ─── TAB 3: VERIFICATION LOGS ─── */}
        {activePath === '/admin/verification-logs' && (
          <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-heading flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-teal" /> Public Verification Audit Trail
                </h3>
                <p className="text-xs text-secondary-text">
                  Complete audit log of all public certificate verification attempts (QR, Number, PDF SHA-256).
                </p>
              </div>

              <button
                onClick={fetchVerificationLogs}
                disabled={isLoadingLogs}
                className="px-3.5 py-2 bg-page-bg hover:bg-border/50 text-heading font-bold text-xs rounded-xl border border-border transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-primary-teal ${isLoadingLogs ? 'animate-spin' : ''}`} />
                Refresh Logs
              </button>
            </div>

            {isLoadingLogs ? (
              <div className="py-16 text-center text-secondary-text space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-teal" />
                <p className="text-xs font-semibold">Loading verification audit logs from MongoDB...</p>
              </div>
            ) : verificationLogs.length === 0 ? (
              <div className="py-16 text-center text-secondary-text space-y-3 border-2 border-dashed border-border rounded-2xl">
                <History className="w-10 h-10 mx-auto text-secondary-text/50" />
                <p className="text-sm font-bold text-heading">No Verification Logs Recorded</p>
                <p className="text-xs">When users or students verify certificates via QR code, ID, or PDF, attempts will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-secondary-text">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Certificate ID / Input</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Client IP</th>
                      <th className="py-3 px-4">Verification Result</th>
                      <th className="py-3 px-4">Blockchain Audit</th>
                      <th className="py-3 px-4 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium">
                    {verificationLogs.map((log, idx) => {
                      const dateStr = log.verifiedAt || log.createdAt
                        ? new Date(log.verifiedAt || log.createdAt).toLocaleString()
                        : 'Just now';

                      const method = log.verificationMethod || 'CERTIFICATE_NUMBER';
                      const result = log.result || 'VALID';
                      const certId = log.certificateId || 'PDF Hash Check';
                      const ip = log.ipAddress || '127.0.0.1';
                      const latency = log.responseTimeMs ? `${log.responseTimeMs}ms` : '< 50ms';

                      return (
                        <tr key={log._id || idx} className="hover:bg-page-bg/50 transition-colors">
                          <td className="py-4 px-4 font-mono text-[11px] text-secondary-text whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-heading">
                            {certId}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded bg-surface border border-border font-bold text-[10px] text-heading uppercase">
                              {method.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-secondary-text">
                            {ip}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              result === 'VALID'
                                ? 'bg-success/10 text-success border-success/30'
                                : result === 'REVOKED'
                                ? 'bg-error/10 text-error border-error/30'
                                : result === 'INTEGRITY_WARNING'
                                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                                : 'bg-secondary-text/10 text-secondary-text border-secondary-text/30'
                            }`}>
                              {result === 'VALID' ? '🟢 AUTHENTIC' : result === 'REVOKED' ? '🔴 REVOKED' : result}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {log.blockchainChecked ? (
                              <span className="text-[11px] text-success font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Sepolia Verified
                              </span>
                            ) : (
                              <span className="text-[11px] text-secondary-text">DB Query Only</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-[11px] text-secondary-text">
                            {latency}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                      <span className="block text-sm font-extrabold">Certificate Saved to MongoDB!</span>
                      <span className="block font-normal">Registered in database with SHA-256 hash & QR code.</span>
                    </div>
                  </div>

                  <BlockchainRegistration
                    certificate={issuedSuccessResult.certificate}
                    onUpdateSuccess={(updated) => {
                      setIssuedSuccessResult((prev: any) => ({ ...prev, certificate: updated }));
                      fetchDashboardData();
                    }}
                  />

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
                      className="px-4 py-2 bg-page-bg hover:bg-border/50 text-heading rounded-xl text-xs font-bold border border-border transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={issueSubmitting}
                      className="px-5 py-2 bg-primary-teal hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {issueSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Issuing...
                        </>
                      ) : (
                        'Issue Certificate'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal for Registering Selected Certificate on Blockchain */}
        {blockchainRegisterTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-[#0A192F] rounded-3xl border border-[#233554] p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative my-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
                <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-lg">
                  <ShieldCheck className="w-6 h-6" /> Register Certificate on Ethereum
                </div>
                <button
                  onClick={() => setBlockchainRegisterTarget(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <BlockchainRegistration
                certificate={blockchainRegisterTarget}
                onUpdateSuccess={() => {
                  fetchDashboardData();
                }}
              />

              <button
                onClick={() => setBlockchainRegisterTarget(null)}
                className="w-full py-2.5 bg-[#112240] border border-[#233554] text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal for Revoke Confirmation */}
        {revokeTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-surface rounded-3xl border border-error/30 p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-error">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="text-lg font-bold">Revoke Certificate</h4>
              </div>

              <p className="text-xs text-secondary-text">
                Are you sure you want to revoke certificate ID{' '}
                <strong className="text-heading font-mono">{revokeTarget.certificateId || revokeTarget.certificateNumber}</strong>?
                This action will mark the certificate as REVOKED.
              </p>

              <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-heading block font-bold">Reason for Revocation</label>
                  <textarea
                    required
                    rows={3}
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Disqualified student or incorrect certificate metadata issued."
                    className="w-full px-3.5 py-2 bg-page-bg rounded-xl border border-border focus:border-error text-heading"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevokeTarget(null)}
                    className="px-4 py-2 bg-page-bg text-heading rounded-xl font-bold border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={revokeSubmitting}
                    className="px-4 py-2 bg-error hover:bg-red-600 text-white rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {revokeSubmitting ? 'Revoking...' : 'Confirm Revocation'}
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

export default AdminDashboardPage;
