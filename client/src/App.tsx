// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DegreesPage from './pages/DegreesPage';
import UploadDegreePage from './pages/UploadDegreePage';
import EditDegreePage from './pages/EditDegreePage';
import MyDegreePage from './pages/MyDegreePage';
import BulkUploadPage from './pages/BulkUploadPage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
          path="bulk-upload"
          element={
            <ProtectedRoute roles={['UniversityAdmin']}>
              <BulkUploadPage />
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
        {/* Student Routes */}
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

