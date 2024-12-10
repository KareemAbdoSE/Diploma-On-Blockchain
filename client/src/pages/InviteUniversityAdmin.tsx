// src/pages/InviteUniversityAdmin.tsx

import React from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

interface University {
  id: number;
  name: string;
  domain: string;
  accreditationDetails?: string;
  adminAssigned: boolean;
  adminEmail: string | null;
  adminAssignedAt: string | null;
}

const inviteAdminSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  universityId: yup.number().required('University is required'),
});

const InviteUniversityAdmin: React.FC = () => {
  const { user } = useAuth();
  const [universities, setUniversities] = React.useState<University[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
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
    fetchUniversities();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      universityId: '',
    },
    validationSchema: inviteAdminSchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
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
              'Content-Type': 'application/json',
            },
          }
        );
        setSuccess(response.data.message);
        resetForm();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send invitation');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 4,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Invite University Admin
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="email"
            name="email"
            label="University Admin Email"
            variant="outlined"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="universityId-label">Select University</InputLabel>
            <Select
              labelId="universityId-label"
              id="universityId"
              name="universityId"
              label="Select University"
              value={formik.values.universityId}
              onChange={formik.handleChange}
              error={formik.touched.universityId && Boolean(formik.errors.universityId)}
            >
              {universities
                .filter((uni) => !uni.adminAssigned)
                .map((uni) => (
                  <MenuItem key={uni.id} value={uni.id}>
                    {uni.name} ({uni.domain})
                  </MenuItem>
                ))
              }
            </Select>
            {formik.touched.universityId && formik.errors.universityId && (
              <Typography variant="caption" color="error">
                {formik.errors.universityId}
              </Typography>
            )}
          </FormControl>
          <Box sx={{ position: 'relative', mt: 3 }}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              Send Invitation
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default InviteUniversityAdmin;
