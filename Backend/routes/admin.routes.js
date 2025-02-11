const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ✅ Admin Authentication
router.post('/login', adminController.adminLogin);

// ✅ Secure Routes (Require Admin Authentication)
router.get('/dashboard', authMiddleware.authAdmin, adminController.getDashboardData);
router.post('/block-user/:id', authMiddleware.authAdmin, adminController.blockUser);
router.post('/unblock-user/:id', authMiddleware.authAdmin, adminController.unblockUser);

// ✅ Ride Management
router.get('/rides', authMiddleware.authAdmin, async (req, res) => {
    try {
        const rides = await rideModel.find()
            .populate('user', 'fullname email mobileNumber')
            .populate('captain', 'fullname email');
        res.status(200).json({ success: true, rides });
    } catch (err) {
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

router.post('/rides/:id/status', authMiddleware.authAdmin, async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.id)
            .populate('user captain');

        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

        ride.status = req.body.status;
        if (req.body.status === 'rejected') {
            ride.rejectionReason = req.body.reason;
        }
        await ride.save();

        await sendEmail(ride.user.email, 'Ride Status Update', `Your ride request has been ${req.body.status}`);
        res.status(200).json({ success: true, ride });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Ride Assignment
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

        sendMessageToSocketId(captain.socketId, 'ride-assigned', ride);
        res.status(200).json({ success: true, ride });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ End Ride
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

// ✅ Cancel Ride
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

// ✅ Payment Management
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

// ✅ Get All Users
router.get('/users', authMiddleware.authAdmin, async (req, res) => {
    try {
        const users = await userModel.find().select('email mobileNumber');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
