const express = require('express');
const router = express.Router();
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const { sendMessageToSocketId } = require('../socket');
const { sendEmail } = require('../services/communication.service');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', adminController.adminLogin);
router.get('/dashboard', authMiddleware.authAdmin, adminController.getDashboardData);
router.post('/block-user/:id', authMiddleware.authAdmin, adminController.blockUser);
router.post('/unblock-user/:id', authMiddleware.authAdmin, adminController.unblockUser);

module.exports = router;

// Get all rides
router.get('/rides', async (req, res) => {
    try {
        const rides = await rideModel.find()
            .populate('user', 'fullname email mobileNumber')
            .populate('captain', 'fullname email');
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get pending rides
router.get('/rides/pending', async (req, res) => {
    try {
        const rides = await rideModel.find({ status: 'pending' })
            .populate('user', 'fullname email mobileNumber');
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve/reject ride
router.post('/rides/:id/status', async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id)
            .populate('user captain');
        
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        // Update ride status
        ride.status = req.body.status;
        if (req.body.status === 'rejected') {
            ride.rejectionReason = req.body.reason;
        }
        
        await ride.save();

        // Notify user via email
        await sendEmail(ride.user.email, 'Ride Status Update', 
            `Your ride request has been ${req.body.status}`);

        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Assign to captain
router.post('/rides/:id/assign', async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id)
            .populate('user captain');
        
        const captain = await captainModel.findById(req.body.captainId);
        if (!captain) return res.status(404).json({ message: 'Captain not found' });

        ride.captain = req.body.captainId;
        ride.status = 'assigned';
        await ride.save();

        // Send emails
        await sendEmail(ride.user.email, 'Ride Assigned', 
            `Your ride has been assigned to Captain ${captain.fullname}`);
        
        await sendEmail(captain.email, 'New Ride Assignment', 
            `You have been assigned a new ride. Details: Pickup - ${ride.pickup}, Destination - ${ride.destination}`);

        // Notify via socket (if applicable)
        sendMessageToSocketId(captain.socketId, 'ride-assigned', ride);

        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// End ride
router.post('/rides/:id/end', async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        ride.status = 'completed';
        await ride.save();

        // Notify user and captain
        await sendEmail(ride.user.email, 'Ride Completed', 'Your ride has been successfully completed.');
        if (ride.captain) {
            await sendEmail(ride.captain.email, 'Ride Completed', 'The ride you were assigned has been marked as completed.');
        }

        res.status(200).json({ message: 'Ride ended successfully', ride });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel ride
router.post('/rides/:id/cancel', async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id)
            .populate('user captain');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });

        ride.status = 'cancelled';
        ride.cancellationReason = req.body.reason || 'Cancelled by admin';
        await ride.save();

        // Notify user and captain
        await sendEmail(ride.user.email, 'Ride Cancelled', 'Your ride has been cancelled.');
        if (ride.captain) {
            await sendEmail(ride.captain.email, 'Ride Cancelled', 'The ride assigned to you has been cancelled.');
        }

        res.status(200).json({ message: 'Ride cancelled successfully', ride });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/pending-payments', async (req, res) => {
    try {
      const rides = await rideModel.find({ 
        paymentType: 'online', 
        isPaymentDone: false 
      }).populate('user captain');
      res.status(200).json(rides);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.post('/complete-payment/:rideId', async (req, res) => {
    try {
      const ride = await rideModel.findByIdAndUpdate(
        req.params.rideId,
        { isPaymentDone: true },
        { new: true }
      );
      res.status(200).json(ride);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.get('/users', async (req, res) => {
    try {
      const users = await userModel.find().select('email mobileNumber');
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
