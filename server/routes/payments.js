import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Ride from '../models/Ride.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const options = {
      amount: Math.round(ride.fare * 100), // Convert to paise
      currency: 'INR',
      receipt: `ride_${rideId}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment
router.post('/verify', async (req, res) => {
  try {
    const {
      rideId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update ride payment status
    ride.paymentStatus = 'completed';
    await ride.save();

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Confirm cash payment
router.post('/cash-confirm', async (req, res) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.paymentMethod !== 'cash') {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    ride.paymentStatus = 'completed';
    await ride.save();

    res.json({ message: 'Cash payment confirmed' });
  } catch (error) {
    console.error('Cash payment confirmation error:', error);
    res.status(500).json({ message: 'Failed to confirm cash payment' });
  }
});

export default router;
