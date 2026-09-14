export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: AdminUser;
}
