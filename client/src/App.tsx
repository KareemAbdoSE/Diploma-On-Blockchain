// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './components/SignUp/SignUpPage'; // Import SignUpPage
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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} /> {/* Add SignUp route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
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

      {/* Unauthorized route */}
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
