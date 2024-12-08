// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  mfaToken: yup.string(), // Optional, only for MFA-enabled users
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      mfaToken: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setLoading(true);
      try {
        await login(values.email, values.password, values.mfaToken || undefined);
        // Redirection is handled in the login function based on role
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email ? formik.errors.email : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password ? formik.errors.password : ''}
          />
          {/* MFA Token Field - Display only if needed */}
          <TextField
            fullWidth
            margin="normal"
            id="mfaToken"
            name="mfaToken"
            label="MFA Token (If Enabled)"
            variant="outlined"
            value={formik.values.mfaToken}
            onChange={formik.handleChange}
            error={formik.touched.mfaToken && Boolean(formik.errors.mfaToken)}
            helperText={formik.touched.mfaToken ? formik.errors.mfaToken : ''}
          />
          <Box sx={{ position: 'relative', mt: 3 }}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
            >
              Login
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

export default LoginPage;
