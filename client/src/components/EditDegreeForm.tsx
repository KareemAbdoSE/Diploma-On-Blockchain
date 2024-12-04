// src/components/EditDegreeForm.tsx

import React from 'react';
import { TextField, Button, Alert, Box, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';

interface FormValues {
  degreeType: string;
  major: string;
  graduationDate: string;
  studentEmail: string;
  degreeFile: File | null;
}

interface Props {
  degree: any;
}

const validationSchema = yup.object().shape({
  degreeType: yup.string().required('Degree Type is required'),
  major: yup.string().required('Major is required'),
  graduationDate: yup.string().required('Graduation Date is required'),
  studentEmail: yup.string().email('Enter a valid email').required('Student Email is required'),
  degreeFile: yup.mixed().nullable(),
});

const EditDegreeForm: React.FC<Props> = ({ degree }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      degreeType: degree.degreeType,
      major: degree.major,
      graduationDate: degree.graduationDate.split('T')[0],
      studentEmail: degree.studentEmail,
      degreeFile: null,
    },
    enableReinitialize: true,
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

        await axios.put(`${process.env.REACT_APP_API_URL}/api/degrees/${degree.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Degree updated successfully');
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to update degree');
      }
    },
  });

  return (
    <Box>
      <Typography variant="h5">Edit Degree ID: {degree.id}</Typography>
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
          helperText={formik.touched.degreeType ? formik.errors.degreeType : undefined}
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
          helperText={formik.touched.major ? formik.errors.major : undefined}
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
          helperText={formik.touched.graduationDate ? formik.errors.graduationDate : undefined}
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
          helperText={formik.touched.studentEmail ? formik.errors.studentEmail : undefined}
        />
        <input
          id="degreeFile"
          name="degreeFile"
          type="file"
          accept=".pdf"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            formik.setFieldValue('degreeFile', event.currentTarget.files ? event.currentTarget.files[0] : null);
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
  );
};

export default EditDegreeForm;
