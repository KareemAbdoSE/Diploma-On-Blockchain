// src/components/DashboardLayout.tsx

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            University Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => handleNavigate('/dashboard')}>
            Degrees
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('/upload-degree')}>
            Upload Degree
          </Button>
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
