// src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: string[]; // Optional: specify allowed roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // While authentication is being verified, show a loading spinner
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role || '')) {
    // Redirect to unauthorized page if user role is not permitted
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child component
  return children;
};

export default ProtectedRoute;
