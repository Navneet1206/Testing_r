import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      verificationOTP: otp
    });

    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `Your verification code is: <b>${otp}</b>`
    });

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -verificationOTP');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
  { name: 'insurance', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    // Update vehicle info for drivers
    if (user.role === 'driver') {
      if (!user.documents) user.documents = {};
      if (!user.documents.vehicle) user.documents.vehicle = {};
      
      user.documents.vehicle.type = req.body.vehicleType || user.documents.vehicle.type;
      user.documents.vehicle.registrationNumber = req.body.vehicleNumber || user.documents.vehicle.registrationNumber;
    }

    // Handle file uploads
    const files = req.files;
    if (files) {
      for (const [fieldName, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          { folder: 'ride-sharing' }
        );

        switch (fieldName) {
          case 'profilePhoto':
            user.profilePhoto = result.secure_url;
            break;
          case 'aadharFront':
            if (!user.documents) user.documents = {};
            if (!user.documents.aadhar) user.documents.aadhar = {};
            user.documents.aadhar.front = result.secure_url;
            break;
          case 'aadharBack':
            if (!user.documents) user.documents = {};
            if (!user.documents.aadhar) user.documents.aadhar = {};
            user.documents.aadhar.back = result.secure_url;
            break;
          case 'licenseFront':
            if (!user.documents) user.documents = {};
            if (!user.documents.license) user.documents.license = {};
            user.documents.license.front = result.secure_url;
            break;
          case 'licenseBack':
            if (!user.documents) user.documents = {};
            if (!user.documents.license) user.documents.license = {};
            user.documents.license.back = result.secure_url;
            break;
          case 'insurance':
            if (!user.documents) user.documents = {};
            if (!user.documents.vehicle) user.documents.vehicle = {};
            user.documents.vehicle.insurance = result.secure_url;
            break;
        }
      }
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `Your password reset code is: <b>${otp}</b>`
    });

    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;