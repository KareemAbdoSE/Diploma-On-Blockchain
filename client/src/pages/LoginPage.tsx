import React from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  mfaToken: yup.string(), // Optional, for MFA-enabled login
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  // State for MFA setup
  const [mfaRequired, setMfaRequired] = React.useState<boolean>(false);
  const [qrCodeDataURL, setQrCodeDataURL] = React.useState<string | null>(null);
  const [mfaTokenInput, setMfaTokenInput] = React.useState<string>('');
  const [mfaError, setMfaError] = React.useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = React.useState<string | null>(null);

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
        const response = await axiosInstance.post('/api/auth/login', {
          email: values.email,
          password: values.password,
          mfaToken: values.mfaToken || undefined,
        });

        if (response.data.mfaRequired) {
          // MFA not set up yet, we have a token to proceed with MFA setup
          setMfaRequired(true);
          localStorage.setItem('token', response.data.token);

          // Initiate MFA setup
          const mfaSetupResponse = await axiosInstance.post('/api/auth/mfa/setup');
          const qrCodeData = mfaSetupResponse.data.qrCodeDataURL;
          setQrCodeDataURL(qrCodeData);
        } else {
          // MFA either not required or is already verified
          // Proceed with normal login flow using useAuth hook
          await login(values.email, values.password, values.mfaToken);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleMfaVerification = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    try {
      const verifyResponse = await axiosInstance.post('/api/auth/mfa/verify-setup', {
        token: mfaTokenInput,
      });
      setMfaSuccess(verifyResponse.data.message || 'MFA setup complete!');

      // After MFA is set up, the user can now log in normally with MFA token.
      // Clear the MFA states and prompt user to login again.
      setTimeout(() => {
        setMfaRequired(false);
        setQrCodeDataURL(null);
        setMfaTokenInput('');
        setMfaError(null);
        setMfaSuccess(null);
      }, 2000);
    } catch (error: any) {
      setMfaError(error.response?.data?.message || 'MFA verification failed.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!mfaRequired && (
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
            {/* MFA Token Field - for when MFA is already enabled and required */}
            <TextField
              fullWidth
              margin="normal"
              id="mfaToken"
              name="mfaToken"
              label="MFA Token (if required)"
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
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </form>
        )}

        {mfaRequired && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Set up MFA
            </Typography>
            {qrCodeDataURL && (
              <div>
                <Typography>
                  Please scan the QR code with your authenticator app:
                </Typography>
                <img src={qrCodeDataURL} alt="MFA QR Code" style={{ margin: '20px 0' }} />
              </div>
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Enter TOTP Code"
              variant="outlined"
              value={mfaTokenInput}
              onChange={(e) => setMfaTokenInput(e.target.value)}
            />
            {mfaError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mfaError}
              </Alert>
            )}
            {mfaSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {mfaSuccess}
              </Alert>
            )}
            <Button
              color="secondary"
              variant="contained"
              fullWidth
              onClick={handleMfaVerification}
              disabled={!mfaTokenInput}
            >
              Verify MFA Setup
            </Button>
            {mfaSuccess && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                MFA setup complete! Please login again with your email, password, and the new MFA token from your authenticator app.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
