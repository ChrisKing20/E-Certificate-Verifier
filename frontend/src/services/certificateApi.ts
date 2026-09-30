import { apiFetch } from './api';
import { Certificate, CertificateListResponse } from '../types/certificate';
import { CertificateBlockchainUpdatePayload } from '../types/blockchain';

export interface CreateCertificateParams {
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  eventDate: string;
  department?: string;
  certificateType?: string;
  file: File;
}

export const createCertificateApi = async (params: CreateCertificateParams): Promise<{
  success: boolean;
  message: string;
  certificate: Certificate;
  qrDataUrl: string;
}> => {
  const formData = new FormData();
  formData.append('recipientName', params.recipientName);
  formData.append('recipientEmail', params.recipientEmail);
  formData.append('eventName', params.eventName);
  formData.append('eventDate', params.eventDate);
  if (params.department) formData.append('department', params.department);
  if (params.certificateType) formData.append('certificateType', params.certificateType);
  formData.append('file', params.file);

  return apiFetch('/certificates', {
    method: 'POST',
    body: formData,
  });
};

export const getCertificatesApi = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<CertificateListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return apiFetch<CertificateListResponse>(`/admin/certificates${queryStr}`);
};

export const getCertificateByIdApi = async (id: string): Promise<{ success: boolean; certificate: Certificate }> => {
  return apiFetch<{ success: boolean; certificate: Certificate }>(`/admin/certificates/${id}`);
};

export const revokeCertificateApi = async (id: string, reason: string): Promise<{
  success: boolean;
  message: string;
  certificate: Certificate;
}> => {
  return apiFetch(`/admin/certificates/${id}/revoke`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

export const updateBlockchainMetadataApi = async (
  id: string,
  payload: CertificateBlockchainUpdatePayload
): Promise<{
  success: boolean;
  message: string;
  certificate: Certificate;
}> => {
  return apiFetch(`/admin/certificates/${id}/blockchain`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};
