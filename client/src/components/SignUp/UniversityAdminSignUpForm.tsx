// src/components/SignUp/UniversityAdminSignUpForm.tsx

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface UniversityAdminSignUpValues {
  email: string;
  password: string;
  confirmPassword: string;
  invitationToken: string;
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm Password is required'),
  invitationToken: yup
    .string()
    .required('Invitation Token is required'),
});

const UniversityAdminSignUpForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formik = useFormik<UniversityAdminSignUpValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      invitationToken: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const response = await axiosInstance.post('/api/auth/register-university-admin', {
          email: values.email,
          password: values.password,
          token: values.invitationToken,
        });

        setSuccess(response.data.message || 'Registration successful!');
        formik.resetForm();

        // Optionally, redirect to login page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          id="invitationToken"
          name="invitationToken"
          label="Invitation Token"
          variant="outlined"
          value={formik.values.invitationToken}
          onChange={formik.handleChange}
          error={
            formik.touched.invitationToken &&
            Boolean(formik.errors.invitationToken)
          }
          helperText={
            formik.touched.invitationToken &&
            formik.errors.invitationToken
          }
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          variant="outlined"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={
            formik.touched.email && Boolean(formik.errors.email)
          }
          helperText={formik.touched.email && formik.errors.email}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={
            formik.touched.password &&
            Boolean(formik.errors.password)
          }
          helperText={
            formik.touched.password && formik.errors.password
          }
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          variant="outlined"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          helperText={
            formik.touched.confirmPassword &&
            formik.errors.confirmPassword
          }
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ position: 'relative' }}>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
        >
          Register as University Admin
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
  );
};

export default UniversityAdminSignUpForm;
