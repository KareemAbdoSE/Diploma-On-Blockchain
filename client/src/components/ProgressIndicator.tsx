// src/components/ProgressIndicator.tsx

import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

interface Props {
  activeStep: number;
}

const steps = ['Initiate Claim', 'Process Payment', 'Confirmation'];

const ProgressIndicator: React.FC<Props> = ({ activeStep }) => {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressIndicator;
