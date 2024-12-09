// src/pages/RegisterUniversityAdmin.tsx

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
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; // Ensure this hook is correctly implemented
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';

// Define the validation schema without 'null' in oneOf
const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match') // Removed 'null'
    .required('Confirm Password is required'),
});

const RegisterUniversityAdmin: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from query parameters
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  // Initialize Formik regardless of the token's presence
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // If token is missing, set an error and do not proceed
      if (!token) {
        setError('Invalid or missing invitation token.');
        return;
      }

      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register-university-admin`, {
          token,
          password: values.password,
        });
        setSuccess('University Admin registered successfully. You can now log in.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Register as University Admin
        </Typography>
        {/* Display error if token is missing */}
        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or missing invitation token.
          </Alert>
        )}
        {/* Display form only if token exists */}
        {token && (
          <>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                id="password"
                name="password"
                label="Password"
                variant="outlined"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              <TextField
                fullWidth
                margin="normal"
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
              <Box sx={{ position: 'relative', mt: 3 }}>
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  Register
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
          </>
        )}
      </Box>
    </Container>
  );
};

export default RegisterUniversityAdmin;
