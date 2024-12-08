// src/components/SignUp/SignUpPage.tsx

import React, { useState } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import StudentSignUpForm from './StudentSignUpForm';
import UniversityAdminSignUpForm from './UniversityAdminSignUpForm';

const SignUpPage: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Sign Up
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Student" />
          <Tab label="University Admin" />
        </Tabs>
        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && <StudentSignUpForm />}
          {tabValue === 1 && <UniversityAdminSignUpForm />}
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;