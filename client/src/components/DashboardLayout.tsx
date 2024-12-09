// src/components/DashboardLayout.tsx

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // State for managing the mobile menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Handlers for mobile menu
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Navigation handler
  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    handleClose();
  };

  // Function to get the dashboard title based on role
  const getTitle = () => {
    if (user?.role === 'PlatformAdmin') {
      return 'Platform Admin Dashboard';
    } else if (user?.role === 'UniversityAdmin') {
      return 'University Admin Dashboard';
    } else if (user?.role === 'Student') {
      return 'Student Dashboard';
    } else {
      return 'Dashboard';
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>

          {/* Dashboard Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>

          {/* Desktop Menu Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* Platform Admin Navigation */}
            {user?.role === 'PlatformAdmin' && (
              <>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard/platform-admin-dashboard')}>
                  Dashboard
                </Button>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard/register-university')}>
                  Register University
                </Button>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard/invite-admin')}>
                  Invite University Admin
                </Button>
              </>
            )}

            {/* University Admin Navigation */}
            {user?.role === 'UniversityAdmin' && (
              <>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard')}>
                  Degrees
                </Button>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard/template-management')}>
                  Manage Templates
                </Button>
                <Button color="inherit" onClick={() => handleNavigate('/dashboard/upload-degree')}>
                  Upload Degree
                </Button>
              </>
            )}

            {/* Student Navigation */}
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

            {/* Logout Button */}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          {/* Mobile Menu Items */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={open}
            onClose={handleClose}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {/* Platform Admin Menu */}
            {user?.role === 'PlatformAdmin' && (
              <>
                <MenuItem onClick={() => handleNavigate('/dashboard/platform-admin-dashboard')}>Dashboard</MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard/register-university')}>Register University</MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard/invite-admin')}>Invite University Admin</MenuItem>
              </>
            )}

            {/* University Admin Menu */}
            {user?.role === 'UniversityAdmin' && (
              <>
                <MenuItem onClick={() => handleNavigate('/dashboard')}>Degrees</MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard/template-management')}>Manage Templates</MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard/upload-degree')}>Upload Degree</MenuItem>
              </>
            )}

            {/* Student Menu */}
            {user?.role === 'Student' && (
              <>
                <MenuItem onClick={() => handleNavigate('/dashboard/student')}>Available Degrees</MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard/my-degree')}>My Degree</MenuItem>
              </>
            )}

            {/* Logout Menu */}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </div>
  );
};

export default DashboardLayout;
