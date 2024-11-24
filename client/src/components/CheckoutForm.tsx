// src/components/CheckoutForm.tsx

import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Include JWT token for authentication
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error fetching client secret:', error);
        setPaymentError('Failed to initialize payment. Please try again.');
      }
    };

    fetchClientSecret();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed');
      setPaymentSuccess(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setPaymentSuccess(true);
      setPaymentError(null);
      // Optionally, inform backend of successful payment
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || paymentSuccess}>
        Pay Now
      </button>
      {paymentError && <div style={{ color: 'red' }}>{paymentError}</div>}
      {paymentSuccess && <div style={{ color: 'green' }}>Payment Successful!</div>}
    </form>
  );
};

export default CheckoutForm;
