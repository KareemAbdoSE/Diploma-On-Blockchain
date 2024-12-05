// src/pages/DegreesPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Degree {
  id: number;
  userId: number | null;
  universityId: number;
  degreeType: string;
  major: string;
  graduationDate: string;
  status: string;
  studentEmail: string;
  user?: {
    id: number;
    email: string;
  };
}

const DegreesPage: React.FC = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>([]);
  const [selectedDegrees, setSelectedDegrees] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [graduationDateFilter, setGraduationDateFilter] = useState<string>('');
  const [majorFilter, setMajorFilter] = useState<string>('');

  // State for search
  const [searchField, setSearchField] = useState<string>('studentEmail');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State for confirmation dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [confirmationStep, setConfirmationStep] = useState<number>(1);

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDegrees(response.data.degrees);
        setFilteredDegrees(response.data.degrees);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch degrees');
      }
    };
    fetchDegrees();
  }, []);

  // Apply filters and search whenever any relevant state changes
  useEffect(() => {
    let filtered = degrees;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((degree) => degree.status === statusFilter);
    }

    // Apply graduation date filter
    if (graduationDateFilter) {
      filtered = filtered.filter(
        (degree) => degree.graduationDate.split('T')[0] === graduationDateFilter
      );
    }

    // Apply major or degree type filter
    if (majorFilter) {
      filtered = filtered.filter(
        (degree) =>
          degree.major.toLowerCase().includes(majorFilter.toLowerCase()) ||
          degree.degreeType.toLowerCase().includes(majorFilter.toLowerCase())
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((degree) => {
        const fieldValue = (degree as any)[searchField]?.toString().toLowerCase();
        return fieldValue?.includes(searchQuery.toLowerCase());
      });
    }

    setFilteredDegrees(filtered);
  }, [
    statusFilter,
    graduationDateFilter,
    majorFilter,
    searchField,
    searchQuery,
    degrees,
  ]);

  const handleEdit = (degreeId: number) => {
    navigate('/dashboard/edit-degrees', { state: { degreeIds: [degreeId] } });
  };

  const handleEditSelectedDegrees = () => {
    navigate('/dashboard/edit-degrees', { state: { degreeIds: selectedDegrees } });
  };

  const handleDelete = async (degreeId: number) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this degree?');
      if (!confirmDelete) return;

      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/degrees/${degreeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDegrees(degrees.filter((degree) => degree.id !== degreeId));
      setSelectedDegrees(selectedDegrees.filter((id) => id !== degreeId));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete degree');
    }
  };

  const handleSelectDegree = (degreeId: number) => {
    if (selectedDegrees.includes(degreeId)) {
      setSelectedDegrees(selectedDegrees.filter((id) => id !== degreeId));
    } else {
      setSelectedDegrees([...selectedDegrees, degreeId]);
    }
  };

  const handleSelectAllDegrees = () => {
    if (selectedDegrees.length === filteredDegrees.length) {
      setSelectedDegrees([]);
    } else {
      const allDegreeIds = filteredDegrees.map((degree) => degree.id);
      setSelectedDegrees(allDegreeIds);
    }
  };

  const handleOpenConfirmDialog = () => {
    setConfirmationStep(1);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = async () => {
    if (confirmationStep === 2) {
      // Revert degrees back to 'draft' if user cancels at second confirmation
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/degrees/revert-confirmation`,
          {
            degreeIds: selectedDegrees,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refresh degrees list
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDegrees(response.data.degrees);
        setSelectedDegrees([]);
      } catch (error: any) {
        console.error('Failed to revert degrees', error);
        setError(error.response?.data?.message || 'Failed to revert degrees');
      }
    }
    setOpenConfirmDialog(false);
    setConfirmationStep(1);
  };

  const handleConfirmDegrees = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/degrees/confirm`,
        {
          degreeIds: selectedDegrees,
          confirmationStep,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh degrees list
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDegrees(response.data.degrees);
      if (confirmationStep === 1) {
        setConfirmationStep(2);
      } else {
        // Close dialog after final confirmation
        setOpenConfirmDialog(false);
        setConfirmationStep(1); // Reset for next use
        setSelectedDegrees([]);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to confirm degrees');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Degrees
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Filters and Search */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {/* Status Filter */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as string)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending_confirmation">Pending Confirmation</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="linked">Linked</MenuItem>
            {/* Add other statuses if needed */}
          </Select>
        </FormControl>

        {/* Graduation Date Filter */}
        <TextField
          label="Graduation Date"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          value={graduationDateFilter}
          onChange={(e) => setGraduationDateFilter(e.target.value)}
        />

        {/* Major or Degree Type Filter */}
        <TextField
          label="Major or Degree Type"
          value={majorFilter}
          onChange={(e) => setMajorFilter(e.target.value)}
        />

        {/* Search Field Dropdown */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Search Field</InputLabel>
          <Select
            value={searchField}
            label="Search Field"
            onChange={(e) => setSearchField(e.target.value as string)}
          >
            <MenuItem value="studentEmail">Student Email</MenuItem>
            <MenuItem value="degreeType">Degree Type</MenuItem>
            <MenuItem value="major">Major</MenuItem>
            {/* Add other searchable fields if needed */}
          </Select>
        </FormControl>

        {/* Search Input */}
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Actions */}
      {selectedDegrees.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleEditSelectedDegrees} sx={{ mr: 1 }}>
            Edit Selected Degrees
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpenConfirmDialog} sx={{ mr: 1 }}>
            Confirm Degrees
          </Button>
        </Box>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                checked={selectedDegrees.length === filteredDegrees.length && filteredDegrees.length > 0}
                indeterminate={
                  selectedDegrees.length > 0 && selectedDegrees.length < filteredDegrees.length
                }
                onChange={handleSelectAllDegrees}
              />
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Student Email</TableCell>
            <TableCell>Degree Type</TableCell>
            <TableCell>Major</TableCell>
            <TableCell>Graduation Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDegrees.map((degree) => (
            <TableRow key={degree.id}>
              <TableCell>
                {(degree.status === 'draft' || degree.status === 'pending_confirmation') && (
                  <Checkbox
                    checked={selectedDegrees.includes(degree.id)}
                    onChange={() => handleSelectDegree(degree.id)}
                  />
                )}
              </TableCell>
              <TableCell>{degree.id}</TableCell>
              <TableCell>{degree.studentEmail}</TableCell>
              <TableCell>{degree.degreeType}</TableCell>
              <TableCell>{degree.major}</TableCell>
              <TableCell>{degree.graduationDate.split('T')[0]}</TableCell>
              <TableCell>{degree.status}</TableCell>
              <TableCell>
                {(degree.status === 'draft' || degree.status === 'pending_confirmation') && (
                  <>
                    <Button size="small" onClick={() => handleEdit(degree.id)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(degree.id)}>
                      Delete
                    </Button>
                  </>
                )}
                {degree.status === 'submitted' && <Typography variant="body2">Submitted</Typography>}
                {degree.status === 'linked' && <Typography variant="body2">Linked to Student</Typography>}
                {/* Handle other statuses if needed */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>
          {confirmationStep === 1 ? 'Confirm Degrees' : 'Final Confirmation'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmationStep === 1
              ? 'Are you sure you want to confirm that the info you want to upload is verified ...'
              : 'This action is irreversible, make sure to double-check ...'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDegrees}
            color="secondary"
            variant="contained"
          >
            {confirmationStep === 1 ? 'Proceed' : 'FINAL CONFIRMATION'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DegreesPage;
