
const express = require('express');
const router = express.Router();
const rideModel = require('../models/ride.model');
const { sendMessageToSocketId } = require('../socket');
const { sendEmail } = require('../services/communication.service');

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
        
        ride.captain = req.body.captainId;
        ride.status = 'assigned';
        await ride.save();

        // Send emails
        await sendEmail(ride.user.email, 'Ride Assigned', 
            `Your ride has been assigned to captain ${captain.fullname.firstname}`);
        
        await sendEmail(captain.email, 'New Ride Assignment', 
            `You have been assigned a new ride. Details: ${ride.pickup} to ${ride.destination}`);

        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;