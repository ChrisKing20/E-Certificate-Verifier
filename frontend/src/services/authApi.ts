import { apiFetch, setAuthToken, clearAuthToken } from './api';
import { LoginResponse } from '../types/auth';

export const getStoredToken = (): string | null => {
  return sessionStorage.getItem('ecv_token') || localStorage.getItem('ecv_token');
};

export const getStoredAdmin = (): any | null => {
  const adminStr = sessionStorage.getItem('ecv_admin_user') || localStorage.getItem('ecv_admin_user');
  if (!adminStr) return null;
  try {
    return JSON.parse(adminStr);
  } catch (_e) {
    return null;
  }
};

export const setAuthStorage = (token: string, admin: any) => {
  setAuthToken(token);
  sessionStorage.setItem('ecv_admin_logged_in', 'true');
  sessionStorage.setItem('ecv_admin_user', JSON.stringify(admin));
  sessionStorage.setItem('ecv_admin_email', admin.email);
  sessionStorage.setItem('ecv_admin_name', admin.name);
  localStorage.setItem('ecv_admin_user', JSON.stringify(admin));
};

export const clearAuthStorage = () => {
  clearAuthToken();
  sessionStorage.removeItem('ecv_admin_user');
  localStorage.removeItem('ecv_admin_user');
};

export const loginAdminApi = async (email: string, password: string): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token && data.admin) {
    setAuthStorage(data.token, data.admin);
  }

  return data;
};

export const logoutAdminApi = () => {
  clearAuthStorage();
};
