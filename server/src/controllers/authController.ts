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
import University from '../models/University';
import { Degree } from '../models/Degree';

dotenv.config();

// Register function for Students with email verification token creation
export const register = async (req: Request, res: Response) => {
  const { email, password, universityId } = req.body;

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

    // Check if university exists and is verified
    const university = await University.findOne({ where: { id: universityId, isVerified: true } });
    if (!university) {
      return res.status(400).json({ message: 'Invalid or unverified university' });
    }

    // Check if email domain matches university domain
    const emailDomain = email.substring(email.indexOf('@')).toLowerCase();
    const universityDomain = university.domain.toLowerCase();
    if (emailDomain !== universityDomain) {
      return res.status(400).json({ message: 'Email domain does not match university domain' });
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
      universityId: university.id,
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

    // Attempt to link degree
    const degree = await Degree.findOne({
      where: {
        studentEmail: email.toLowerCase(),
        status: 'submitted',
        userId: null,
      },
    });

    if (degree) {
      degree.userId = user.id;
      degree.status = 'linked';
      await degree.save();

      // Send notification email to the student about linked degree
      await transporter.sendMail({
        to: email,
        subject: 'Degree Linked to Your Account',
        html: `<p>Hi,<br>Your degree in ${degree.major} has been successfully linked to your account. You can now view it in your dashboard.</p>`,
      });
    }

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email to complete registration.',
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, mfaToken } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({
      where: { email },
      include: [Role],
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Check if University Admin and MFA not enabled
    if (user.role.name === 'UniversityAdmin' && !user.mfaEnabled) {
      // Generate a temporary token to proceed with MFA setup
      const tempToken = jwt.sign(
        { userId: user.id, roleId: user.roleId, role: 'UniversityAdmin' },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      return res.status(200).json({
        message: 'MFA setup required. Please set up MFA before logging in.',
        mfaRequired: true,
        token: tempToken,
      });
    }

    // If University Admin and MFA is enabled, verify the provided mfaToken
    if (user.role.name === 'UniversityAdmin' && user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(400).json({ message: 'MFA token is required' });
      }

      const mfaVerified = speakeasy.totp.verify({
        secret: user.mfaSecret!,
        encoding: 'base32',
        token: mfaToken,
      });

      if (!mfaVerified) {
        return res.status(400).json({ message: 'Invalid MFA token' });
      }
    }

    // Generate final JWT token for authenticated user
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, role: user.role.name },
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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `Diploma Verification (${user.email})`,
    });

    user.mfaTempSecret = secret.base32;
    await user.save();

    const otpAuthURL = secret.otpauth_url;
    if (!otpAuthURL) {
      return res.status(500).json({ message: 'Error generating OTP Auth URL' });
    }

    const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL);

    return res.status(200).json({
      message: 'MFA setup initiated',
      qrCodeDataURL,
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

    const user = await User.findByPk(userId);
    if (!user || !user.mfaTempSecret) {
      return res.status(400).json({ message: 'MFA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaTempSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.mfaSecret = user.mfaTempSecret;
      user.mfaEnabled = true;
      user.mfaTempSecret = null;
      await user.save();

      return res.status(200).json({ message: 'MFA setup complete' });
    } else {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying MFA setup', error });
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

    user.isVerified = true;
    await user.save();

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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const universityAdminRole = await Role.findOne({ where: { name: 'UniversityAdmin' } });
    if (!universityAdminRole) {
      return res.status(500).json({ message: 'UniversityAdmin role not found' });
    }

    const user = await User.create({
      email,
      password,
      roleId: universityAdminRole.id,
      isVerified: true,
      universityId,
      mfaEnabled: false, // MFA not set yet
    } as UserCreationAttributes);

    await InvitationToken.destroy({ where: { id: invitation.id } });

    // Generate a JWT token to allow immediate MFA setup
    const jwtToken = jwt.sign(
      { userId: user.id, roleId: user.roleId, role: 'UniversityAdmin' },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(201).json({
      message: 'University Admin registered successfully.',
      userId: user.id,
      token: jwtToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering university admin', error });
  }
};
