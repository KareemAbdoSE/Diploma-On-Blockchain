// src/pages/PlatformAdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface University {
  id: number;
  name: string;
  domain: string;
  accreditationDetails?: string;
  createdAt: string;
  updatedAt: string;
  adminAssigned: boolean;
  adminEmail: string | null;
  adminAssignedAt: string | null;
}

const PlatformAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchVerifiedUniversities = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/universities/verified`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUniversities(response.data.universities);
      setFilteredUniversities(response.data.universities);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedUniversities();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      setFilteredUniversities(universities);
    } else {
      const filtered = universities.filter(
        (uni) =>
          uni.name.toLowerCase().includes(term) ||
          uni.domain.toLowerCase().includes(term)
      );
      setFilteredUniversities(filtered);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Platform Admin Dashboard</Typography>
        <Box>
          <Typography variant="subtitle1">Logged in as: {user?.email}</Typography>
          <Typography variant="subtitle2">Role: {user?.role}</Typography>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Verified Universities
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Search by Name or Domain"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
            />
          </Box>
          {filteredUniversities.length === 0 ? (
            <Typography>No verified universities found.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Domain</TableCell>
                    <TableCell>Accreditation Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Admin Email</TableCell>
                    <TableCell>Admin Signed Up At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUniversities.map((uni) => (
                    <TableRow key={uni.id}>
                      <TableCell>{uni.id}</TableCell>
                      <TableCell>{uni.name}</TableCell>
                      <TableCell>{uni.domain}</TableCell>
                      <TableCell>
                        {uni.accreditationDetails && uni.accreditationDetails.trim() !== ''
                          ? uni.accreditationDetails
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{uni.adminAssigned ? 'Signed Up' : 'Not Signed Up'}</TableCell>
                      <TableCell>{uni.adminAssigned ? uni.adminEmail : 'N/A'}</TableCell>
                      <TableCell>
                        {uni.adminAssigned && uni.adminAssignedAt
                          ? new Date(uni.adminAssignedAt).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default PlatformAdminDashboard;
