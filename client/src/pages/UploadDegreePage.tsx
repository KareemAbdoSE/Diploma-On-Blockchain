// src/pages/UploadDegreePage.tsx

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface FormValues {
  degreeType: string;
  major: string;
  graduationDate: string;
  studentEmail: string;
}

const validationSchema = yup.object({
  degreeType: yup.string().required('Degree Type is required'),
  major: yup.string().required('Major is required'),
  graduationDate: yup.date().required('Graduation Date is required'),
  studentEmail: yup.string().email('Enter a valid email').required('Student Email is required'),
});

const UploadDegreePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const formik = useFormik<FormValues>({
    initialValues: {
      degreeType: '',
      major: '',
      graduationDate: '',
      studentEmail: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.REACT_APP_API_URL}/api/degrees/upload`, {
          degreeType: values.degreeType,
          major: values.major,
          graduationDate: values.graduationDate,
          studentEmail: values.studentEmail,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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
            id="degreeType"
            name="degreeType"
            label="Degree Type"
            variant="outlined"
            value={formik.values.degreeType}
            onChange={formik.handleChange}
            error={formik.touched.degreeType && Boolean(formik.errors.degreeType)}
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
            error={formik.touched.major && Boolean(formik.errors.major)}
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
            error={formik.touched.graduationDate && Boolean(formik.errors.graduationDate)}
            helperText={formik.touched.graduationDate ? formik.errors.graduationDate : ''}
          />
          <TextField
            fullWidth
            margin="normal"
            id="studentEmail"
            name="studentEmail"
            label="Student Email"
            variant="outlined"
            value={formik.values.studentEmail}
            onChange={formik.handleChange}
            error={formik.touched.studentEmail && Boolean(formik.errors.studentEmail)}
            helperText={formik.touched.studentEmail ? formik.errors.studentEmail : ''}
          />
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Upload
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default UploadDegreePage;
