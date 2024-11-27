// src/pages/UploadDegreePage.tsx

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface FormValues {
  userId: string;
  degreeType: string;
  major: string;
  graduationDate: string;
  degreeFile: File | null;
}

const validationSchema = yup.object({
  userId: yup.number().required('Student User ID is required').integer('User ID must be an integer'),
  degreeType: yup.string().required('Degree Type is required'),
  major: yup.string().required('Major is required'),
  graduationDate: yup.date().required('Graduation Date is required'),
  degreeFile: yup.mixed().required('Degree file is required'),
});

const UploadDegreePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const formik = useFormik<FormValues>({
    initialValues: {
      userId: '',
      degreeType: '',
      major: '',
      graduationDate: '',
      degreeFile: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('userId', values.userId);
        formData.append('degreeType', values.degreeType);
        formData.append('major', values.major);
        formData.append('graduationDate', values.graduationDate);
        if (values.degreeFile) {
          formData.append('degreeFile', values.degreeFile);
        }

        await axios.post(`${process.env.REACT_APP_API_URL}/api/degrees/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Degree uploaded successfully');
        formik.resetForm();
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to upload degree');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Degree
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="userId"
            name="userId"
            label="Student User ID"
            variant="outlined"
            value={formik.values.userId}
            onChange={formik.handleChange}
            error={formik.touched.userId && !!formik.errors.userId}
            helperText={formik.touched.userId ? formik.errors.userId : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="degreeType"
            name="degreeType"
            label="Degree Type"
            variant="outlined"
            value={formik.values.degreeType}
            onChange={formik.handleChange}
            error={formik.touched.degreeType && !!formik.errors.degreeType}
            helperText={formik.touched.degreeType ? formik.errors.degreeType : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="major"
            name="major"
            label="Major"
            variant="outlined"
            value={formik.values.major}
            onChange={formik.handleChange}
            error={formik.touched.major && !!formik.errors.major}
            helperText={formik.touched.major ? formik.errors.major : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="graduationDate"
            name="graduationDate"
            label="Graduation Date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            value={formik.values.graduationDate}
            onChange={formik.handleChange}
            error={formik.touched.graduationDate && !!formik.errors.graduationDate}
            helperText={formik.touched.graduationDate ? formik.errors.graduationDate : ''}
          />
          <input
            id="degreeFile"
            name="degreeFile"
            type="file"
            accept=".pdf"
            onChange={(event: any) => {
              formik.setFieldValue('degreeFile', event.currentTarget.files[0]);
            }}
          />
          {formik.touched.degreeFile && formik.errors.degreeFile && (
            <div style={{ color: 'red' }}>{formik.errors.degreeFile}</div>
          )}
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Upload
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default UploadDegreePage;
