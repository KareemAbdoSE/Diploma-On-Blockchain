// src/components/DashboardLayout.tsx

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [uploadDegreeAnchorEl, setUploadDegreeAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getTitle = () => {
    if (user?.role === 'UniversityAdmin') {
      return 'University Admin Dashboard';
    } else if (user?.role === 'Student') {
      return 'Student Dashboard';
    } else {
      return 'Dashboard';
    }
  };

  const handleUploadDegreeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUploadDegreeAnchorEl(event.currentTarget);
  };

  const handleUploadDegreeClose = () => {
    setUploadDegreeAnchorEl(null);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>

          {user?.role === 'UniversityAdmin' && (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard')}>
                Degrees
              </Button>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard/template-management')}>
                Manage Templates
              </Button>
              <Button color="inherit" onClick={handleUploadDegreeClick}>
                Upload Degree
              </Button>
              <Menu
                anchorEl={uploadDegreeAnchorEl}
                open={Boolean(uploadDegreeAnchorEl)}
                onClose={handleUploadDegreeClose}
              >
                <MenuItem
                  onClick={() => {
                    handleUploadDegreeClose();
                    handleNavigate('/dashboard/upload-degree');
                  }}
                >
                  Single
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleUploadDegreeClose();
                    handleNavigate('/dashboard/bulk-upload');
                  }}
                >
                  Bulk
                </MenuItem>
              </Menu>
            </>
          )}

          {user?.role === 'Student' && (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/dashboard/student')}>
                Available Degrees
              </Button>
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
