import { apiFetch } from './api';

export interface DashboardStats {
  totalCertificates: number;
  validCertificates: number;
  revokedCertificates: number;
  totalVerifications: number;
  invalidAttempts: number;
}

export const getDashboardStatsApi = async (): Promise<{ success: boolean; stats: DashboardStats }> => {
  return apiFetch<{ success: boolean; stats: DashboardStats }>('/admin/dashboard/stats');
};

export const getVerificationLogsApi = async (params?: { page?: number; limit?: number }) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return apiFetch(`/admin/verification-logs${queryStr}`);
};

export const retryBlockchainRegistrationApi = async (certificateId: string) => {
  return apiFetch(`/admin/certificates/${encodeURIComponent(certificateId)}/blockchain/register`, {
    method: 'POST',
  });
};
