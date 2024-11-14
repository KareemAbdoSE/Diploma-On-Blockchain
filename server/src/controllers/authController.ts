// src/controllers/authController.ts
import { Request, Response } from 'express';
import { User, UserCreationAttributes } from '../models/User';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import transporter from '../config/emailConfig';
import crypto from 'crypto';
import VerificationToken from '../models/VerificationToken';
import { Op } from 'sequelize';

// Register function with email verification token creation
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, roleId } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user with the hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      roleId,
      isVerified: false,  // New users are unverified by default
    } as UserCreationAttributes);

    // Generate and save a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 3600000), // Token valid for 1 hour
    });

    // Send verification email
    const verificationUrl = `${process.env.BASE_URL}/api/auth/confirm-email?token=${verificationToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Please verify your email by clicking on the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    });

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email to complete registration.',
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login function with email verification check
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in.' });
    }

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token directly in the login function
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};

// Email verification function
export const confirmEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() }, // Token must not be expired
      },
    });

    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findByPk(verificationToken.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    // Delete the verification token after use
    await VerificationToken.destroy({ where: { id: verificationToken.id } });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying email', error });
  }
};
