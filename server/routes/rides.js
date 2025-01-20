import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import axios from 'axios';

const router = express.Router();

// Find nearest drivers
const findNearestDrivers = async (pickup, vehicleType, maxDistance = 5000) => {
  return await User.find({
    role: 'driver',
    isVerified: true,
    isApproved: true,
    'documents.vehicle.type': vehicleType,
    isAvailable: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: pickup.coordinates
        },
        $maxDistance: maxDistance // 5km radius
      }
    }
  })
  .limit(5) // Get top 5 nearest drivers
  .select('name phone profilePhoto location documents.vehicle');
};

// Book a ride
router.post('/book', auth, async (req, res) => {
  try {
    const {
      pickup,
      dropoff,
      vehicleType,
      paymentMethod,
      passengers = 1
    } = req.body;

    // Validate passenger count
    const vehicleLimits = {
      bike: 1,
      auto: 3,
      sedan: 4,
      suv: 6
    };

    if (passengers > vehicleLimits[vehicleType]) {
      return res.status(400).json({
        message: `${vehicleType} can only accommodate ${vehicleLimits[vehicleType]} passengers`
      });
    }

    // Get route details from Gomap.pro
    const routeResponse = await axios.get(`${process.env.GOMAP_BASE_URL}/directions/json`, {
      params: {
        origin: `${pickup.coordinates[0]},${pickup.coordinates[1]}`,
        destination: `${dropoff.coordinates[0]},${dropoff.coordinates[1]}`,
        key: process.env.GOMAP_API_KEY
      }
    });

    const route = routeResponse.data.routes[0];
    const distance = route.legs[0].distance.value / 1000; // Convert to kilometers
    const duration = route.legs[0].duration.value / 60; // Convert to minutes

    // Calculate fare
    const pricing = {
      bike: { base: 30, perKm: 8, perMin: 1 },
      auto: { base: 40, perKm: 12, perMin: 1.5 },
      sedan: { base: 60, perKm: 15, perMin: 2 },
      suv: { base: 80, perKm: 18, perMin: 2.5 }
    };

    const price = pricing[vehicleType];
    const fare = Math.round(
      price.base + 
      (price.perKm * distance) + 
      (price.perMin * duration)
    );

    // Find nearest available drivers
    const nearestDrivers = await findNearestDrivers(pickup, vehicleType);
    
    if (nearestDrivers.length === 0) {
      return res.status(404).json({ message: 'No drivers available nearby' });
    }

    // Create ride request
    const ride = new Ride({
      passengerId: req.user._id,
      pickup,
      dropoff,
      distance,
      duration,
      fare,
      vehicleType,
      paymentMethod,
      passengers,
      route: route.overview_polyline.points // Store route polyline for map display
    });

    await ride.save();

    // If online payment, create Razorpay order
    if (paymentMethod === 'razorpay') {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const order = await razorpay.orders.create({
        amount: fare * 100, // Convert to paise
        currency: 'INR',
        receipt: `ride_${ride._id}`,
        payment_capture: 1
      });

      return res.json({
        ride,
        nearestDrivers,
        paymentDetails: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        }
      });
    }

    res.json({ ride, nearestDrivers });
  } catch (error) {
    console.error('Book ride error:', error);
    res.status(500).json({ message: 'Failed to book ride' });
  }
});

// Driver: Update location
router.post('/location', auth, async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update location' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates
      }
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// Driver: Toggle availability
router.post('/availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update availability' });
    }

    await User.findByIdAndUpdate(req.user._id, { isAvailable });
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

export default router;