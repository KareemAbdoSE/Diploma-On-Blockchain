// src/components/StudentDegreeCard.tsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  Dialog,
} from '@mui/material';
import { Degree } from '../types/Degree';
import ClaimDegreeModal from './ClaimDegreeModal';

interface Props {
  degree: Degree;
  onClaimSuccess: () => void;
}

const StudentDegreeCard: React.FC<Props> = ({ degree, onClaimSuccess }) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClaimClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {degree.degreeType} in {degree.major}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Graduation Date: {new Date(degree.graduationDate).toLocaleDateString()}
          </Typography>
          {/* Removed Description */}
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" onClick={handleClaimClick}>
            Claim Degree
          </Button>
        </CardActions>
      </Card>

      <ClaimDegreeModal
        open={open}
        onClose={handleClose}
        degree={degree}
        onClaimSuccess={onClaimSuccess}
      />
    </>
  );
};

export default StudentDegreeCard;
