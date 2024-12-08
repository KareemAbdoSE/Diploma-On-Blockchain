import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface Template {
  id: number;
  templateName: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

const validationSchema = yup.object({
  templateName: yup.string().required('Template Name is required'),
  templateFile: yup.mixed().nullable(),
});

const TemplateManagementPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch templates from the server
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/template/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTemplates(response.data.templates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Open dialog to update a template
  const handleOpenDialog = (template: Template) => {
    setSelectedTemplate(template);
    setOpenDialog(true);
    formik.setFieldValue('templateName', template.templateName);
    formik.setFieldValue('templateFile', null);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    formik.resetForm();
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: number) => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/template/${templateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  // Formik setup for upload and update
  const formik = useFormik({
    initialValues: {
      templateName: '',
      templateFile: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(null);
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('templateName', values.templateName);
        if (values.templateFile) {
          formData.append('templateFile', values.templateFile);
        }

        const url = selectedTemplate
          ? `${process.env.REACT_APP_API_URL}/api/template/${selectedTemplate.id}`
          : `${process.env.REACT_APP_API_URL}/api/template/upload`;
        const method = selectedTemplate ? 'put' : 'post';

        const response = await axios({
          method,
          url,
          data: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200 || response.status === 201) {
          setSuccess(selectedTemplate ? 'Template updated successfully' : 'Template uploaded successfully');
          fetchTemplates();
          handleCloseDialog();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to upload or update template');
      }
    },
  });

  // View template function
  const handleViewTemplate = (filePath: string) => {
    const fileURL = `${process.env.REACT_APP_API_URL}/${filePath}`;
    window.open(fileURL, '_blank');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Template Management
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {templates.length === 0 ? (
              <Box>
                <Typography>No templates uploaded yet.</Typography>
                <form onSubmit={formik.handleSubmit}>
                  <TextField
                    fullWidth
                    margin="normal"
                    id="templateName"
                    name="templateName"
                    label="Template Name"
                    variant="outlined"
                    value={formik.values.templateName}
                    onChange={formik.handleChange}
                    error={formik.touched.templateName && Boolean(formik.errors.templateName)}
                    helperText={formik.touched.templateName ? formik.errors.templateName : ''}
                  />
                  <Button variant="contained" component="label" sx={{ mt: 2 }}>
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.png,.jpg"
                      onChange={(e) =>
                        formik.setFieldValue('templateFile', e.currentTarget.files?.[0] || null)
                      }
                    />
                  </Button>
                  {formik.values.templateFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected File: {(formik.values.templateFile as File).name}
                    </Typography>
                  )}
                  <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
                    Upload Template
                  </Button>
                </form>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Template Name</TableCell>
                    <TableCell>View</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.templateName}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleViewTemplate(template.filePath)}
                        >
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="contained" onClick={() => handleOpenDialog(template)}>
                          Update
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ ml: 2 }}
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogContent>
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                id="templateName"
                name="templateName"
                label="Template Name"
                variant="outlined"
                value={formik.values.templateName}
                onChange={formik.handleChange}
                error={formik.touched.templateName && Boolean(formik.errors.templateName)}
                helperText={formik.touched.templateName}
              />
              <Button variant="contained" component="label">
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.png,.jpg"
                  onChange={(e) =>
                    formik.setFieldValue('templateFile', e.currentTarget.files?.[0] || null)
                  }
                />
              </Button>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={() => formik.handleSubmit()} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TemplateManagementPage;
