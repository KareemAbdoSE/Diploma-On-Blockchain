// src/pages/StudentDashboard.tsx

import React from 'react';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useAvailableDegrees } from '../hooks/useAvailableDegrees';
import StudentDegreeCard from '../components/StudentDegreeCard';

const StudentDashboard: React.FC = () => {
  const { degrees, loading, error, refetch } = useAvailableDegrees();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Degrees for Claiming
        </Typography>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && degrees.length === 0 && (
          <Alert severity="info">No degrees available for claiming at the moment.</Alert>
        )}
        {!loading && !error && degrees.length > 0 && (
          <Grid container spacing={3}>
            {degrees.map((degree) => (
              <Grid item xs={12} sm={6} md={4} key={degree.id}>
                <StudentDegreeCard degree={degree} onClaimSuccess={refetch} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StudentDashboard;
