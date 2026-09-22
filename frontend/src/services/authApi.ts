import { apiFetch, setAuthToken, clearAuthToken, API_BASE_URL } from './api';
import { LoginResponse, AuthUser } from '../types/auth';

export const getStoredToken = (): string | null => {
  return sessionStorage.getItem('ecv_token') || localStorage.getItem('ecv_token');
};

export const getStoredUser = (): AuthUser | null => {
  const userStr = sessionStorage.getItem('ecv_user') || localStorage.getItem('ecv_user') || sessionStorage.getItem('ecv_admin_user') || localStorage.getItem('ecv_admin_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (_e) {
    return null;
  }
};

export const setAuthStorage = (token: string, user: AuthUser) => {
  setAuthToken(token);
  sessionStorage.setItem('ecv_token', token);
  localStorage.setItem('ecv_token', token);
  sessionStorage.setItem('ecv_user', JSON.stringify(user));
  localStorage.setItem('ecv_user', JSON.stringify(user));
  // Backward compatibility alias for legacy admin views
  sessionStorage.setItem('ecv_admin_user', JSON.stringify(user));
};

export const clearAuthStorage = () => {
  clearAuthToken();
  sessionStorage.removeItem('ecv_token');
  localStorage.removeItem('ecv_token');
  sessionStorage.removeItem('ecv_user');
  localStorage.removeItem('ecv_user');
  sessionStorage.removeItem('ecv_admin_user');
  localStorage.removeItem('ecv_admin_user');
};

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const userData = data.user || data.admin;
  if (data.token && userData) {
    setAuthStorage(data.token, userData);
  }

  return data;
};

export const registerUserApi = async (name: string, email: string, password: string): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  const userData = data.user || data.admin;
  if (data.token && userData) {
    setAuthStorage(data.token, userData);
  }

  return data;
};

export const loginAdminApi = loginApi; // Alias for existing components

export const initiateGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

export const getCurrentUserApi = async (): Promise<{ success: boolean; user?: AuthUser }> => {
  return await apiFetch<{ success: boolean; user?: AuthUser }>('/auth/me');
};

export const logoutAdminApi = () => {
  clearAuthStorage();
};

