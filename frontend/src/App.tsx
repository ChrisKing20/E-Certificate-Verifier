import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { VerifyCentralPage } from "./pages/VerifyCentralPage";
import { VerifyNumberPage } from "./pages/VerifyNumberPage";
import { VerifyPdfPage } from "./pages/VerifyPdfPage";
import { VerifyQrPage } from "./pages/VerifyQrPage";
import { UserLoginPage } from "./pages/UserLoginPage";
import { UserSignupPage } from "./pages/UserSignupPage";
import { InstitutionRegisterPage } from "./pages/InstitutionRegisterPage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { SuperAdminDashboardPage } from "./pages/SuperAdminDashboardPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-page-bg text-primary-text">
          <Routes>
            {/* Public Certificate Verification Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/verify" element={<VerifyCentralPage />} />
            <Route path="/verify/number" element={<VerifyNumberPage />} />
            <Route path="/verify/pdf" element={<VerifyPdfPage />} />
            <Route path="/verify/qr" element={<VerifyQrPage />} />

            {/* Student / User Authentication Routes */}
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/signup" element={<UserSignupPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Institution Onboarding Registration */}
            <Route path="/register-institution" element={<InstitutionRegisterPage />} />

            {/* Protected Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]}>
                  <UserDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Super Admin Dashboard */}
            <Route
              path="/superadmin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <SuperAdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Public Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issue"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification-logs"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Unknown route fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;