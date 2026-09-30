export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('ecv_token') || localStorage.getItem('ecv_token');
};

export const setAuthToken = (token: string, remember: boolean = true) => {
  sessionStorage.setItem('ecv_token', token);
  if (remember) {
    localStorage.setItem('ecv_token', token);
  }
};

export const clearAuthToken = () => {
  sessionStorage.removeItem('ecv_token');
  sessionStorage.removeItem('ecv_admin_logged_in');
  sessionStorage.removeItem('ecv_admin_email');
  localStorage.removeItem('ecv_token');
};

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type if FormData is used (browser sets multipart boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
};
