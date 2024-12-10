// src/components/SignUp/UniversityAdminSignUpForm.tsx

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface UniversityAdminSignUpValues {
  password: string;
  confirmPassword: string;
  invitationToken: string;
}

const validationSchema = yup.object({
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

  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string>('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);

  const formik = useFormik<UniversityAdminSignUpValues>({
    initialValues: {
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
          password: values.password,
          token: values.invitationToken,
        });

        setSuccess(response.data.message || 'Registration successful!');
        formik.resetForm();

        const receivedToken = response.data.token;
        if (!receivedToken) {
          setError('No token returned. Please contact support.');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', receivedToken);

        // Initiate MFA setup
        const mfaSetupResponse = await axiosInstance.post('/api/auth/mfa/setup');
        const qrCodeData = mfaSetupResponse.data.qrCodeDataURL;
        setQrCodeDataURL(qrCodeData);
        setShowMfaSetup(true);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed.');
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
        token: mfaToken,
      });
      setMfaSuccess(verifyResponse.data.message || 'MFA setup complete!');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error: any) {
      setMfaError(error.response?.data?.message || 'MFA verification failed.');
    }
  };

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

      {success && !showMfaSetup && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ position: 'relative', mb: 2 }}>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading || showMfaSetup}
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

      {showMfaSetup && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Set up MFA
          </Typography>
          {qrCodeDataURL && (
            <div>
              <Typography>Please scan the QR code with your authenticator app:</Typography>
              <img src={qrCodeDataURL} alt="MFA QR Code" style={{ margin: '20px 0' }} />
            </div>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Enter TOTP Code"
            variant="outlined"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value)}
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
            disabled={!mfaToken}
          >
            Verify MFA Setup
          </Button>
        </Box>
      )}
    </form>
  );
};

export default UniversityAdminSignUpForm;
