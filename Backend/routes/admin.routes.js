const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Import required models and services
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const { sendEmail } = require('../services/communication.service');
const { sendMessageToSocketId } = require('../socket');

// ✅ Admin Authentication
router.post('/login', adminController.adminLogin);

// ✅ Secure Routes (Require Admin Authentication)
router.get('/dashboard', authMiddleware.authAdmin, adminController.getDashboardData);
router.post('/block-user/:id', authMiddleware.authAdmin, adminController.blockUser);
router.post('/unblock-user/:id', authMiddleware.authAdmin, adminController.unblockUser);

// ✅ Ride Management Endpoints
router.get('/rides', authMiddleware.authAdmin, async (req, res) => {
    try {
        const rides = await rideModel.find()
            .populate('user', 'fullname email mobileNumber')
            .populate('captain', 'fullname email');
        res.status(200).json({ success: true, rides });
    } catch (err) {
        console.error("Error fetching rides in admin routes:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/rides/pending', authMiddleware.authAdmin, async (req, res) => {
    try {
        const rides = await rideModel.find({ status: 'pending' })
            .populate('user', 'fullname email mobileNumber');
        res.status(200).json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Updated ride status endpoint using findByIdAndUpdate (see previous answer for details)
router.post('/rides/:id/status', authMiddleware.authAdmin, async (req, res) => {
  try {
    const updateData = { status: req.body.status };
    if (req.body.status === 'rejected') {
      updateData.rejectionReason = req.body.reason;
    }
    
    const ride = await rideModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'fullname email mobileNumber')
      .populate('captain', 'fullname email');
    
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    
    console.log("Updated ride:", ride);
    
    if (ride.user && ride.user.email) {
      try {
        await sendEmail(
          ride.user.email,
          'Ride Status Update',
          `Your ride request has been ${req.body.status}`
        );
      } catch (emailErr) {
        console.error("Error sending email:", emailErr);
      }
    } else {
      console.warn("Ride does not have user information; skipping email notification.");
    }
    
    res.status(200).json({ success: true, ride });
  } catch (err) {
    console.error("Error updating ride status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Ride Assignment Endpoint (already exists)
router.post('/rides/:id/assign', authMiddleware.authAdmin, async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id).populate('user captain');
        const captain = await captainModel.findById(req.body.captainId);
        if (!captain) return res.status(404).json({ success: false, message: 'Captain not found' });

        ride.captain = req.body.captainId;
        ride.status = 'assigned';
        await ride.save();

        await sendEmail(ride.user.email, 'Ride Assigned', `Your ride has been assigned to Captain ${captain.fullname}`);
        await sendEmail(captain.email, 'New Ride Assignment', `New ride assigned. Pickup - ${ride.pickup}, Destination - ${ride.destination}`);

        sendMessageToSocketId(captain.socketId, {
          event: 'ride-assigned',
          data: ride
        });
        res.status(200).json({ success: true, ride });
    } catch (err) {
        console.error("Error in ride assignment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/rides/:id/end', authMiddleware.authAdmin, async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id);
        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

        ride.status = 'completed';
        await ride.save();

        await sendEmail(ride.user.email, 'Ride Completed', 'Your ride has been successfully completed.');
        if (ride.captain) {
            await sendEmail(ride.captain.email, 'Ride Completed', 'The ride you were assigned has been marked as completed.');
        }
        res.status(200).json({ success: true, message: 'Ride ended successfully', ride });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/rides/:id/cancel', authMiddleware.authAdmin, async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id).populate('user captain');
        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

        ride.status = 'cancelled';
        ride.cancellationReason = req.body.reason || 'Cancelled by admin';
        await ride.save();

        await sendEmail(ride.user.email, 'Ride Cancelled', 'Your ride has been cancelled.');
        if (ride.captain) {
            await sendEmail(ride.captain.email, 'Ride Cancelled', 'The ride assigned to you has been cancelled.');
        }
        res.status(200).json({ success: true, message: 'Ride cancelled successfully', ride });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/pending-payments', authMiddleware.authAdmin, async (req, res) => {
    try {
        const rides = await rideModel.find({ paymentType: 'online', isPaymentDone: false })
            .populate('user captain');
        res.status(200).json({ success: true, rides });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/complete-payment/:rideId', authMiddleware.authAdmin, async (req, res) => {
    try {
        const ride = await rideModel.findByIdAndUpdate(
            req.params.rideId,
            { isPaymentDone: true },
            { new: true }
        );
        res.status(200).json({ success: true, ride });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/users', authMiddleware.authAdmin, async (req, res) => {
    try {
        const users = await userModel.find().select('email mobileNumber');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// === New Endpoints for Captains ===

// GET Captains
router.get('/captains', authMiddleware.authAdmin, async (req, res) => {
  try {
    const captains = await captainModel.find().select('fullname email status vehicle mobileNumber');
    res.status(200).json({ success: true, captains });
  } catch (err) {
    console.error("Error fetching captains:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Block Captain
router.post('/block-captain/:id', authMiddleware.authAdmin, async (req, res) => {
  try {
    const captain = await captainModel.findByIdAndUpdate(
      req.params.id,
      { status: 'blocked' },
      { new: true }
    );
    if (!captain) {
      return res.status(404).json({ success: false, message: 'Captain not found' });
    }
    res.status(200).json({ success: true, captain });
  } catch (err) {
    console.error("Error blocking captain:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Unblock Captain
router.post('/unblock-captain/:id', authMiddleware.authAdmin, async (req, res) => {
  try {
    const captain = await captainModel.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!captain) {
      return res.status(404).json({ success: false, message: 'Captain not found' });
    }
    res.status(200).json({ success: true, captain });
  } catch (err) {
    console.error("Error unblocking captain:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
