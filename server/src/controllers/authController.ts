// src/controllers/authController.ts

import { Request, Response } from 'express';
import { User, UserCreationAttributes } from '../models/User';
import { Role } from '../models/Role';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import dotenv from 'dotenv';
import VerificationToken from '../models/VerificationToken';
import InvitationToken from '../models/InvitationToken';
import transporter from '../config/emailConfig';
import { Op } from 'sequelize';
import logger from '../logger';

dotenv.config();

// Register function with email verification token creation
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Get the Student role
    const role = await Role.findOne({ where: { name: 'Student' } });
    if (!role) {
      return res.status(500).json({ message: 'Role not found' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      roleId: role.id,
      isVerified: false,
    });

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
  const { email, password, token: mfaToken, backupCode } = req.body;

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Retrieve the user
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // If MFA is enabled
    if (user.mfaEnabled) {
      if (!mfaToken && !backupCode) {
        return res.status(400).json({ message: 'MFA token or backup code is required' });
      }

      let mfaVerified = false;

      if (mfaToken) {
        // Verify TOTP token
        mfaVerified = speakeasy.totp.verify({
          secret: user.mfaSecret!,
          encoding: 'base32',
          token: mfaToken,
        });
      } else if (backupCode) {
        // Verify backup code
        if (user.mfaBackupCodes && user.mfaBackupCodes.length > 0) {
          const normalizedBackupCodes = user.mfaBackupCodes.map((code) => code.toLowerCase());
          const providedBackupCode = backupCode.trim().toLowerCase();

          if (normalizedBackupCodes.includes(providedBackupCode)) {
            mfaVerified = true;
            // Remove used backup code
            user.mfaBackupCodes = user.mfaBackupCodes.filter(
              (code) => code.toLowerCase() !== providedBackupCode
            );
            await user.save();
          }
        }
      }

      if (!mfaVerified) {
        return res.status(400).json({ message: 'Invalid MFA token or backup code' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred during login.' });
  }
};

export const setupMFA = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `Diploma Verification (${user.email})`,
    });

    // Temporarily store the secret in the database
    user.mfaTempSecret = secret.base32;
    await user.save();

    // Generate QR code
    const otpAuthURL = secret.otpauth_url;

    if (!otpAuthURL) {
      return res.status(500).json({ message: 'Error generating OTP Auth URL' });
    }

    // Generate QR code image URL
    const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL);

    // Send the QR code to the client
    return res.status(200).json({
      message: 'MFA setup initiated',
      qrCodeDataURL,
      // base32Secret: secret.base32, // Do not send in production
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error setting up MFA', error });
  }
};

export const verifyMFASetup = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { token } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve the user
    const user = await User.findByPk(userId);

    if (!user || !user.mfaTempSecret) {
      return res.status(400).json({ message: 'MFA setup not initiated' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaTempSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      // Save the MFA secret
      user.mfaSecret = user.mfaTempSecret;
      user.mfaEnabled = true;
      user.mfaTempSecret = null; // Clear the temp secret

      // Generate backup codes
      const backupCodes = generateBackupCodes();
      user.mfaBackupCodes = backupCodes;

      await user.save();

      return res.status(200).json({
        message: 'MFA setup complete',
        backupCodes, // Provide backup codes to the user
      });
    } else {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying MFA setup', error });
  }
};

export const regenerateBackupCodes = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve the user
    const user = await User.findByPk(userId);

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is not enabled for this user' });
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    user.mfaBackupCodes = backupCodes;

    await user.save();

    return res.status(200).json({
      message: 'Backup codes regenerated',
      backupCodes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error regenerating backup codes', error });
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

// Utility function to generate backup codes
const generateBackupCodes = (): string[] => {
  const backupCodes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(4).toString('hex');
    backupCodes.push(code);
  }
  return backupCodes;
};