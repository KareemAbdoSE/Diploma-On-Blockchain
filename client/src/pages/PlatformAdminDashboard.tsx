// src/pages/PlatformAdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface University {
  id: number;
  name: string;
  domain: string;
  accreditationDetails?: string;
}

const registerUniversitySchema = yup.object({
  name: yup.string().required('University name is required'),
  domain: yup
    .string()
    .matches(/^@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, 'Enter a valid domain starting with "@" (e.g., @example.edu)')
    .required('Domain is required'),
  accreditationDetails: yup.string(),
});

const inviteAdminSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  universityId: yup.number().required('University ID is required'),
});

const PlatformAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState<boolean>(false);

  // Fetch existing universities
  const fetchUniversities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/universities/verified`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUniversities(response.data.universities);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch universities');
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Formik for Register University
  const formikRegister = useFormik({
    initialValues: {
      name: '',
      domain: '',
      accreditationDetails: '',
    },
    validationSchema: registerUniversitySchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/universities/register`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccess(response.data.message);
        resetForm();
        // Optionally, refetch universities
        fetchUniversities();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to register university');
      }
    },
  });

  // Formik for Invite University Admin
  const formikInvite = useFormik({
    initialValues: {
      email: '',
      universityId: '',
    },
    validationSchema: inviteAdminSchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/universities/invite-admin`,
          {
            email: values.email,
            universityId: parseInt(values.universityId, 10),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccess(response.data.message);
        resetForm();
        setInviteDialogOpen(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to invite University Admin');
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Platform Admin Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Register University Section */}
      <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Register a New University
        </Typography>
        <form onSubmit={formikRegister.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="name"
            name="name"
            label="University Name"
            variant="outlined"
            value={formikRegister.values.name}
            onChange={formikRegister.handleChange}
            error={formikRegister.touched.name && Boolean(formikRegister.errors.name)}
            helperText={formikRegister.touched.name && formikRegister.errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            id="domain"
            name="domain"
            label="Domain (e.g., @example.edu)"
            variant="outlined"
            value={formikRegister.values.domain}
            onChange={formikRegister.handleChange}
            error={formikRegister.touched.domain && Boolean(formikRegister.errors.domain)}
            helperText={formikRegister.touched.domain && formikRegister.errors.domain}
          />
          <TextField
            fullWidth
            margin="normal"
            id="accreditationDetails"
            name="accreditationDetails"
            label="Accreditation Details"
            variant="outlined"
            multiline
            rows={3}
            value={formikRegister.values.accreditationDetails}
            onChange={formikRegister.handleChange}
            error={
              formikRegister.touched.accreditationDetails &&
              Boolean(formikRegister.errors.accreditationDetails)
            }
            helperText={
              formikRegister.touched.accreditationDetails &&
              formikRegister.errors.accreditationDetails
            }
          />
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Register University
          </Button>
        </form>
      </Box>

      {/* Invite University Admin Section */}
      <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          University Admins
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setInviteDialogOpen(true)}>
          Invite University Admin
        </Button>

        {/* Invite Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Invite University Admin</DialogTitle>
          <DialogContent>
            <form onSubmit={formikInvite.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                id="email"
                name="email"
                label="University Admin Email"
                variant="outlined"
                type="email"
                value={formikInvite.values.email}
                onChange={formikInvite.handleChange}
                error={formikInvite.touched.email && Boolean(formikInvite.errors.email)}
                helperText={formikInvite.touched.email && formikInvite.errors.email}
              />
              <TextField
                select
                fullWidth
                margin="normal"
                id="universityId"
                name="universityId"
                label="Select University"
                variant="outlined"
                value={formikInvite.values.universityId}
                onChange={formikInvite.handleChange}
                error={formikInvite.touched.universityId && Boolean(formikInvite.errors.universityId)}
                helperText={formikInvite.touched.universityId && formikInvite.errors.universityId}
              >
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name} ({uni.domain})
                  </option>
                ))}
              </TextField>
              <Box sx={{ mt: 2 }}>
                <Button color="primary" variant="contained" fullWidth type="submit">
                  Send Invitation
                </Button>
              </Box>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PlatformAdminDashboard;
