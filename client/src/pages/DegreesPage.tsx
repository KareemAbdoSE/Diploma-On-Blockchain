// src/pages/DegreesPage.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Alert, Checkbox } from '@mui/material';
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
  const [selectedDegrees, setSelectedDegrees] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch degrees');
      }
    };
    fetchDegrees();
  }, []);

  const handleEdit = (degreeId: number) => {
    navigate(`/edit-degree/${degreeId}`);
  };

  const handleDelete = async (degreeId: number) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this degree?');
      if (!confirm) return;

      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/degrees/${degreeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDegrees(degrees.filter((degree) => degree.id !== degreeId));
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

  const handleConfirmDegrees = async (confirmationStep: number) => {
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
      setSelectedDegrees([]);
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
      {selectedDegrees.length > 0 && (
        <div>
          <Button variant="contained" color="primary" onClick={() => handleConfirmDegrees(1)} sx={{ mr: 1 }}>
            Confirm Step 1
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleConfirmDegrees(2)}>
            Confirm Step 2
          </Button>
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
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
          {degrees.map((degree) => (
            <TableRow key={degree.id}>
              <TableCell>
                {degree.status === 'draft' || degree.status === 'pending_confirmation' ? (
                  <Checkbox
                    checked={selectedDegrees.includes(degree.id)}
                    onChange={() => handleSelectDegree(degree.id)}
                  />
                ) : null}
              </TableCell>
              <TableCell>{degree.id}</TableCell>
              <TableCell>{degree.studentEmail}</TableCell>
              <TableCell>{degree.degreeType}</TableCell>
              <TableCell>{degree.major}</TableCell>
              <TableCell>{new Date(degree.graduationDate).toLocaleDateString()}</TableCell>
              <TableCell>{degree.status}</TableCell>
              <TableCell>
                {degree.status === 'draft' && (
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
                {/* Add additional status handling if needed */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DegreesPage;
