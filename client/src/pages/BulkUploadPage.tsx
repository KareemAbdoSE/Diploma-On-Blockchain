// src/pages/BulkUploadPage.tsx

import React, { useState } from 'react';
import { Container, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const BulkUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  // Removed 'user' since it's not used
  const { isAuthenticated } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setErrors([]);
    setSuccess(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/degrees/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccess(response.data.message);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload degrees');
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bulk Upload Degrees
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          disabled={!file}
        >
          Upload
        </Button>
        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Errors:</Typography>
            {errors.map((err, index) => (
              <Alert severity="error" key={index}>
                Row: {JSON.stringify(err.row)} - Error: {err.error}
              </Alert>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BulkUploadPage;
