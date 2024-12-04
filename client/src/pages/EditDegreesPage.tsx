// src/pages/EditDegreesPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Button, Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import EditDegreeForm from '../components/EditDegreeForm';

const EditDegreesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { degreeIds } = location.state as { degreeIds: number[] };
  const [degrees, setDegrees] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/degrees/get-multiple`,
          { degreeIds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDegrees(response.data.degrees);
      } catch (error: any) {
        // Handle error
      }
    };
    fetchDegrees();
  }, [degreeIds]);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, degrees.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (degrees.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <EditDegreeForm degree={degrees[currentIndex]} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" onClick={handlePrev} disabled={currentIndex === 0}>
            Previous
          </Button>
          <Typography>
            {currentIndex + 1} of {degrees.length}
          </Typography>
          <Button variant="contained" onClick={handleNext} disabled={currentIndex === degrees.length - 1}>
            Next
          </Button>
        </Box>
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
          Done
        </Button>
      </Box>
    </Container>
  );
};

export default EditDegreesPage;
