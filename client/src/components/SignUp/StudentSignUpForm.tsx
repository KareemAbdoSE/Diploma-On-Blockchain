// src/components/SignUp/StudentSignUpForm.tsx

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

interface StudentSignUpValues {
  email: string;
  password: string;
  confirmPassword: string;
  universityId: number;
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
  universityId: yup
    .number()
    .required('University ID is required')
    .positive('University ID must be a positive number')
    .integer('University ID must be an integer'),
});

const StudentSignUpForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formik = useFormik<StudentSignUpValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      universityId: 0,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const response = await axiosInstance.post('/api/auth/register', {
          email: values.email,
          password: values.password,
          universityId: values.universityId,
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

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          id="universityId"
          name="universityId"
          label="University ID"
          type="number"
          variant="outlined"
          value={formik.values.universityId}
          onChange={formik.handleChange}
          error={
            formik.touched.universityId &&
            Boolean(formik.errors.universityId)
          }
          helperText={
            formik.touched.universityId &&
            formik.errors.universityId
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
          Register as Student
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

export default StudentSignUpForm;
