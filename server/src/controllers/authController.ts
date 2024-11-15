// src/controllers/authController.ts
import { Request, Response } from 'express';
import { User, UserCreationAttributes } from '../models/User';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import transporter from '../config/emailConfig';
import crypto from 'crypto';
import VerificationToken from '../models/VerificationToken';
import { Op } from 'sequelize';
import { Role } from '../models/Role'; // Updated import
import InvitationToken from '../models/InvitationToken';


export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Get the Student role
    const studentRole = await Role.findOne({ where: { name: 'Student' } });
    if (!studentRole) {
      return res.status(500).json({ message: 'Student role not found' });
    }

    // Create a new user with the Student role
    const user = await User.create({
      email,
      password,
      roleId: studentRole.id,
      isVerified: false,
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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Explicitly type user as User | null
    const user: User | null = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in.' });
    }

    // Use the validatePassword method from the User model
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
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


export const confirmEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() },
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

export const registerUniversityAdmin = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    const invitation = await InvitationToken.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    const { email, universityId } = invitation;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Get the UniversityAdmin role
    const universityAdminRole = await Role.findOne({ where: { name: 'UniversityAdmin' } });
    if (!universityAdminRole) {
      return res.status(500).json({ message: 'UniversityAdmin role not found' });
    }

    // Create the new user
    const user = await User.create({
      email,
      password,
      roleId: universityAdminRole.id,
      isVerified: true,
      universityId,
    } as UserCreationAttributes);

    // Delete the invitation token after use
    await InvitationToken.destroy({ where: { id: invitation.id } });

    return res.status(201).json({
      message: 'University Admin registered successfully.',
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering university admin', error });
  }
};
