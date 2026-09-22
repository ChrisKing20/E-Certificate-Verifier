import { apiFetch } from './api';
import { Certificate } from '../types/certificate';
import { AuthUser } from '../types/auth';

export interface UserCertificatesResponse {
  success: boolean;
  count: number;
  data: Certificate[];
}

export interface UserProfileResponse {
  success: boolean;
  data: AuthUser;
}

export const getUserCertificatesApi = async (): Promise<UserCertificatesResponse> => {
  return await apiFetch<UserCertificatesResponse>('/user/certificates');
};

export const getUserProfileApi = async (): Promise<UserProfileResponse> => {
  return await apiFetch<UserProfileResponse>('/user/profile');
};
