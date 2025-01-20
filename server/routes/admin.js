import express from 'express';
import User from '../models/User.js';
import { isAdmin } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// Get all drivers
router.get('/drivers', isAdmin, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Failed to fetch drivers' });
  }
});

// Approve driver
router.post('/drivers/:id/approve', isAdmin, async (req, res) => {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.isApproved = true;
    await driver.save(); 

    // Send email notification to driver
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: driver.email,
      subject: 'Driver Application Approved',
      html: `
        <h1>Congratulations!</h1>
        <p>Your driver application has been approved. You can now start accepting rides.</p>
      `
    });

    res.json({ message: 'Driver approved successfully' });
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ message: 'Failed to approve driver' });
  }
});

// Reject driver
router.post('/drivers/:id/reject', isAdmin, async (req, res) => {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.isApproved = false;
    await driver.save();

    // Send email notification to driver
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: driver.email,
      subject: 'Driver Application Update',
      html: `
        <h1>Application Status Update</h1>
        <p>We regret to inform you that your driver application has been rejected. Please ensure all your documents are valid and up to date before reapplying.</p>
      `
    });

    res.json({ message: 'Driver rejected successfully' });
  } catch (error) {
    console.error('Reject driver error:', error);
    res.status(500).json({ message: 'Failed to reject driver' });
  }
});

export default router;