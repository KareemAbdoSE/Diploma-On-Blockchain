// src/controllers/userController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';

export const updateWalletAddress = async (req: Request, res: Response) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user?.userId;
  const { walletAddress } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the wallet address
    user.walletAddress = walletAddress;
    await user.save();

    return res.status(200).json({ message: 'Wallet address updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating wallet address', error });
  }
};

export const getWalletAddress = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user
    const user = await User.findByPk(userId, {
      attributes: ['walletAddress'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ walletAddress: user.walletAddress });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving wallet address', error });
  }
};
