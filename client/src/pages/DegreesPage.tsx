// src/pages/DegreesPage.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Degree {
  id: number;
  userId: number;
  universityId: number;
  degreeType: string;
  major: string;
  graduationDate: string;
  status: string;
  user: {
    id: number;
    email: string;
  };
}

const DegreesPage: React.FC = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
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

  // ... inside DegreesPage component

  const handleConfirm = async (degreeIds: number[], confirmationStep: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/degrees/confirm`,
        {
          degreeIds,
          confirmationStep,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update degrees status in state
      // Fetch degrees again or update the specific degrees
      const updatedDegrees = degrees.map((degree) => {
        if (degreeIds.includes(degree.id)) {
          if (confirmationStep === 1) {
            return { ...degree, status: 'pending_confirmation' };
          } else if (confirmationStep === 2) {
            return { ...degree, status: 'confirmed' };
          }
        }
        return degree;
      });
      setDegrees(updatedDegrees);
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
      <Table>
        <TableHead>
          <TableRow>
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
              <TableCell>{degree.id}</TableCell>
              <TableCell>{degree.user.email}</TableCell>
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
                    <Button size="small" onClick={() => handleConfirm([degree.id], 1)}>
                      Confirm Step 1
                    </Button>
                  </>
                )}
                {degree.status === 'pending_confirmation' && (
                  <>
                    <Button size="small" onClick={() => handleConfirm([degree.id], 2)}>
                      Confirm Step 2
                    </Button>
                  </>
                )}
                {degree.status === 'confirmed' && (
                  <Typography variant="body2">Confirmed</Typography>
                )}
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
