import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-secondary-text font-bold">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && admin?.role !== 'SUPER_ADMIN' && admin?.role !== requiredRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
