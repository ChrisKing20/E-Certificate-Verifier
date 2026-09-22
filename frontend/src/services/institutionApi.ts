import { apiFetch } from './api';
import { Institution, InstitutionRegisterPayload } from '../types/auth';

export interface InstitutionListResponse {
  success: boolean;
  count: number;
  data: Institution[];
}

export const registerInstitutionApi = async (payload: InstitutionRegisterPayload) => {
  return await apiFetch<{ success: boolean; message: string; data: Institution }>('/institutions/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getInstitutionsApi = async (status?: string): Promise<InstitutionListResponse> => {
  const query = status ? `?status=${status}` : '';
  return await apiFetch<InstitutionListResponse>(`/institutions${query}`);
};

export const approveInstitutionApi = async (id: string) => {
  return await apiFetch<{ success: boolean; message: string; data: Institution }>(`/institutions/${id}/approve`, {
    method: 'PATCH',
  });
};

export const rejectInstitutionApi = async (id: string, reason?: string) => {
  return await apiFetch<{ success: boolean; message: string; data: Institution }>(`/institutions/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
};

export const suspendInstitutionApi = async (id: string) => {
  return await apiFetch<{ success: boolean; message: string; data: Institution }>(`/institutions/${id}/suspend`, {
    method: 'PATCH',
  });
};
