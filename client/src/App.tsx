// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './components/SignUp/SignUpPage'; // Existing SignUpPage
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DegreesPage from './pages/DegreesPage';
import UploadDegreePage from './pages/UploadDegreePage';
import EditDegreePage from './pages/EditDegreePage';
import MyDegreePage from './pages/MyDegreePage';
import BulkUploadPage from './pages/BulkUploadPage';
import EditDegreesPage from './pages/EditDegreesPage';
import TemplateManagementPage from './pages/TemplateManagementPage';
import StudentDashboard from './pages/StudentDashboard';
import PlatformAdminLogin from './pages/PlatformAdminLogin';
import PlatformAdminDashboard from './pages/PlatformAdminDashboard';
import RegisterUniversity from './pages/RegisterUniversity';
import InviteUniversityAdmin from './pages/InviteUniversityAdmin';
import RegisterUniversityAdmin from './pages/RegisterUniversityAdmin'; // University Admin Registration

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/platform-admin/login" element={<PlatformAdminLogin />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/register-university-admin" element={<RegisterUniversityAdmin />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Platform Admin Routes */}
        <Route
          path="platform-admin-dashboard"
          element={
            <ProtectedRoute roles={['PlatformAdmin']}>
              <PlatformAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="register-university"
          element={
            <ProtectedRoute roles={['PlatformAdmin']}>
              <RegisterUniversity />
            </ProtectedRoute>
          }
        />
        <Route
          path="invite-admin"
          element={
            <ProtectedRoute roles={['PlatformAdmin']}>
              <InviteUniversityAdmin />
            </ProtectedRoute>
          }
        />

        {/* University Admin Routes */}
        <Route
          index
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <DegreesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="upload-degree"
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <UploadDegreePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit-degrees"
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <EditDegreesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bulk-upload"
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <BulkUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="template-management"
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <TemplateManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="student"
          element={
            <ProtectedRoute roles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-degree"
          element={
            <ProtectedRoute roles={['Student']}>
              <MyDegreePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
