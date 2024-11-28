// src/components/DashboardLayout.tsx

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getTitle = () => {
    if (user.role === 'UniversityAdmin') {
      return 'University Admin Dashboard';
    } else if (user.role === 'Student') {
      return 'Student Dashboard';
    } else {
      return 'Dashboard';
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>
          {user.role === 'UniversityAdmin' && (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard')}>
                Degrees
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard/upload-degree')}>
                Upload Degree
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard/bulk-upload')}>
                Bulk Upload
              </Button>
            </>
          )}
          {user.role === 'Student' && (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard/my-degree')}>
                My Degree
              </Button>
            </>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
};

export default DashboardLayout;
