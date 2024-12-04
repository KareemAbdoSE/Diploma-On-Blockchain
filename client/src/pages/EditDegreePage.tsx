// src/pages/EditDegreePage.tsx

import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';

const validationSchema = yup.object({
  degreeType: yup.string().required('Degree Type is required'),
  major: yup.string().required('Major is required'),
  graduationDate: yup.date().required('Graduation Date is required'),
  studentEmail: yup.string().email('Enter a valid email').required('Student Email is required'),
  degreeFile: yup.mixed(),
});

const EditDegreePage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialValues, setInitialValues] = useState({
    degreeType: '',
    major: '',
    graduationDate: '',
    studentEmail: '',
    degreeFile: null as File | null,
  });

  useEffect(() => {
    const fetchDegree = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const degree = response.data.degree;
        if (degree.status !== 'draft') {
          setError('Only degrees in draft status can be edited.');
          setLoading(false);
          return;
        }
        setInitialValues({
          degreeType: degree.degreeType,
          major: degree.major,
          graduationDate: degree.graduationDate.split('T')[0], // Format date for input
          studentEmail: degree.studentEmail,
          degreeFile: null,
        });
        setLoading(false);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch degree');
        setLoading(false);
      }
    };
    fetchDegree();
  }, [id]);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true, // Allow formik to update initialValues
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('degreeType', values.degreeType);
        formData.append('major', values.major);
        formData.append('graduationDate', values.graduationDate);
        formData.append('studentEmail', values.studentEmail);
        if (values.degreeFile) {
          formData.append('degreeFile', values.degreeFile);
        }

        await axios.put(`${process.env.REACT_APP_API_URL}/api/degrees/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Degree updated successfully');
        // Optionally redirect back to degrees page
        navigate('/dashboard');
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to update degree');
      }
    },
  });

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Degree
        </Typography>
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
          <TextField
            fullWidth
            margin="normal"
            id="studentEmail"
            name="studentEmail"
            label="Student Email"
            variant="outlined"
            value={formik.values.studentEmail}
            onChange={formik.handleChange}
            error={formik.touched.studentEmail && !!formik.errors.studentEmail}
            helperText={formik.touched.studentEmail ? formik.errors.studentEmail : ''}
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
            Update Degree
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default EditDegreePage;
