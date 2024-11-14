// src/config/emailConfig.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Default to Gmail's SMTP
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // Use TLS (secure should be true if port is 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allows connection if Gmail enforces stricter TLS settings
  },
});

export default transporter;
