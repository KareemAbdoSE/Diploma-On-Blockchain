// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DegreesPage from './pages/DegreesPage';
import UploadDegreePage from './pages/UploadDegreePage';
import EditDegreePage from './pages/EditDegreePage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Redirect root path based on authentication status */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DegreesPage />} />
          <Route path="/upload-degree" element={<UploadDegreePage />} />
          <Route path="/edit-degree/:id" element={<EditDegreePage />} />
          {/* Add more routes as needed */}
        </Route>
      </Route>
      {/* Optional: Catch-all route to handle unmatched paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
