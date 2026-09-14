import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminApi, getStoredToken, getStoredAdmin, clearAuthStorage, setAuthStorage } from '../services/authApi';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(getStoredAdmin());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = getStoredToken();
    const savedAdmin = getStoredAdmin();
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(savedAdmin);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginAdminApi(email, pass);
      if (res.token && res.admin) {
        setToken(res.token);
        setAdmin(res.admin as AdminUser);
        setAuthStorage(res.token, res.admin as AdminUser);
      } else {
        throw new Error(res.message || 'Login failed. Invalid token response.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
