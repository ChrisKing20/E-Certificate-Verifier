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

            {/* Public Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issue"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification-logs"
              element={
                <ProtectedRoute>
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