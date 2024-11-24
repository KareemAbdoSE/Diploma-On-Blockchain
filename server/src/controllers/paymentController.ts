// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { stripe } from '../config/stripeConfig';

export const createPaymentIntent = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Define the amount to charge (e.g., $20.00 represented in cents)
    const amount = 2000;

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: userId.toString() },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
