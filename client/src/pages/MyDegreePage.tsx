// src/pages/MyDegreePage.tsx

import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface Degree {
  id: number;
  universityId: number;
  degreeType: string;
  major: string;
  graduationDate: string;
  status: string;
  university: {
    name: string;
  };
}

const MyDegreePage: React.FC = () => {
  const [degree, setDegree] = useState<Degree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDegree = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/degrees/my-degree`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDegree(response.data.degree);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch degree');
      }
    };
    fetchDegree();
  }, []);

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!degree) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Degree
        </Typography>
        <Typography variant="body1">
          <strong>University:</strong> {degree.university.name}
        </Typography>
        <Typography variant="body1">
          <strong>Degree Type:</strong> {degree.degreeType}
        </Typography>
        <Typography variant="body1">
          <strong>Major:</strong> {degree.major}
        </Typography>
        <Typography variant="body1">
          <strong>Graduation Date:</strong> {new Date(degree.graduationDate).toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default MyDegreePage;
