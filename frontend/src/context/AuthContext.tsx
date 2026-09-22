import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerUserApi, getStoredToken, getStoredUser, clearAuthStorage, setAuthStorage, getCurrentUserApi } from '../services/authApi';
import { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  admin: AuthUser | null; // fallback alias for legacy components
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthUser>;
  register: (name: string, email: string, pass: string) => Promise<AuthUser>;
  setSessionFromToken: (token: string, userPayload: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getStoredToken();
      const savedUser = getStoredUser();
      
      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }
        // Verify token with backend
        try {
          const res = await getCurrentUserApi();
          if (res.success && res.user) {
            setUser(res.user);
            setAuthStorage(savedToken, res.user);
          }
        } catch (_err) {
          // Token expired or invalid
          clearAuthStorage();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, pass);
      const authUser = res.user || res.admin;
      if (res.token && authUser) {
        setToken(res.token);
        setUser(authUser);
        setAuthStorage(res.token, authUser);
        return authUser;
      } else {
        throw new Error(res.message || 'Login failed. Invalid response.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await registerUserApi(name, email, pass);
      const authUser = res.user || res.admin;
      if (res.token && authUser) {
        setToken(res.token);
        setUser(authUser);
        setAuthStorage(res.token, authUser);
        return authUser;
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setSessionFromToken = (newToken: string, userPayload: AuthUser) => {
    setToken(newToken);
    setUser(userPayload);
    setAuthStorage(newToken, userPayload);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin: user, // legacy fallback for existing Admin components
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        setSessionFromToken,
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

