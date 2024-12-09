// src/pages/RegisterUniversity.tsx

import React from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

const validationSchema = yup.object({
  name: yup.string().required('University name is required'),
  domain: yup
    .string()
    .matches(/^@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, 'Enter a valid domain starting with "@" (e.g., @example.edu)')
    .required('Domain is required'),
  accreditationDetails: yup.string(),
});

const RegisterUniversity: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      domain: '',
      accreditationDetails: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/universities/register`,
          values,
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
        setError(err.response?.data?.message || 'Failed to register university');
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
          Register a New University
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="name"
            name="name"
            label="University Name"
            variant="outlined"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            fullWidth
            margin="normal"
            id="domain"
            name="domain"
            label="Domain (e.g., @example.edu)"
            variant="outlined"
            value={formik.values.domain}
            onChange={formik.handleChange}
            error={formik.touched.domain && Boolean(formik.errors.domain)}
            helperText={formik.touched.domain && formik.errors.domain}
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
            value={formik.values.accreditationDetails}
            onChange={formik.handleChange}
            error={
              formik.touched.accreditationDetails &&
              Boolean(formik.errors.accreditationDetails)
            }
            helperText={
              formik.touched.accreditationDetails &&
              formik.errors.accreditationDetails
            }
          />
          <Box sx={{ position: 'relative', mt: 3 }}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              Register University
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

export default RegisterUniversity;
