// src/pages/LoginPage.tsx

import React from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  mfaToken: yup.string(),
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      mfaToken: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await login(values.email, values.password, values.mfaToken || undefined);
      } catch (error: any) {
        setError(error.message || 'Login failed');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
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
            error={formik.touched.email && !!formik.errors.email}
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
            error={formik.touched.password && !!formik.errors.password}
            helperText={formik.touched.password ? formik.errors.password : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="mfaToken"
            name="mfaToken"
            label="MFA Code (Optional)"
            variant="outlined"
            value={formik.values.mfaToken}
            onChange={formik.handleChange}
            error={formik.touched.mfaToken && !!formik.errors.mfaToken}
            helperText={formik.touched.mfaToken ? formik.errors.mfaToken : ''}
          />
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;


