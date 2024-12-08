// src/components/ClaimDegreeModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Degree } from '../types/Degree';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Initialize Stripe outside of component to avoid recreation on render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  open: boolean;
  onClose: () => void;
  degree: Degree;
  onClaimSuccess: () => void;
}

const ClaimDegreeModal: React.FC<Props> = ({ open, onClose, degree, onClaimSuccess }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Claim Degree</DialogTitle>
      <DialogContent>
        <Elements stripe={stripePromise}>
          <ClaimDegreeForm degree={degree} onClose={onClose} onClaimSuccess={onClaimSuccess} />
        </Elements>
      </DialogContent>
      <DialogActions>
        {/* Actions are handled within the form */}
      </DialogActions>
    </Dialog>
  );
};

interface FormProps {
  degree: Degree;
  onClose: () => void;
  onClaimSuccess: () => void;
}

const ClaimDegreeForm: React.FC<FormProps> = ({ degree, onClose, onClaimSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create PaymentIntent on the backend
      const paymentIntentResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/create-payment-intent`,
        {
          degreeId: degree.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { clientSecret } = paymentIntentResponse.data;

      // Step 2: Confirm Card Payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Payment information is incomplete.');
        setProcessing(false);
        return;
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || 'Payment failed.');
        setProcessing(false);
        return;
      }

      if (paymentResult.paymentIntent?.status === 'succeeded') {
        // Step 3: Notify backend of successful payment to claim the degree
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/degrees/claim`,
          {
            degreeId: degree.id,
            paymentIntentId: paymentResult.paymentIntent.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setSuccess('Degree claimed successfully!');
        onClaimSuccess();
        setProcessing(false);

        // Optionally, close the modal after a delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Payment processing failed.');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          {degree.degreeType} in {degree.major}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Graduation Date: {new Date(degree.graduationDate).toLocaleDateString()}
        </Typography>
        {/* Removed Description */}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Payment Details</Typography>
        <CardElement options={{ hidePostalCode: true }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!stripe || processing}
        fullWidth
      >
        {processing ? <CircularProgress size={24} /> : 'Pay and Claim'}
      </Button>
    </form>
  );
};

export default ClaimDegreeModal;
