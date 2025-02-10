// Backend/routes/ride.routes.js
const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const PaymentTransaction = require("../models/PaymentTransaction.model");

// Online Payment Flow: Initiate Razorpay order
router.post('/initiate-payment', 
  authMiddleware.authUser,
  body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
  body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
  body('vehicleType').isString().isIn(['4-seater hatchback', '4-seater sedan', '7-seater SUV', '7-seater MUV']).withMessage('Invalid vehicle type'),
  body('rideDate').isString().notEmpty().withMessage('Ride date is required'),
  body('rideTime').isString().notEmpty().withMessage('Ride time is required'),
  rideController.initiatePaymentOrder
);

// Online Payment Flow: Confirm payment and create ride
router.post('/confirm-online', 
  authMiddleware.authUser,
  rideController.confirmOnlineRide
);

// Cash Payment Flow: Create ride for cash payment
router.post('/create-cash',
  authMiddleware.authUser,
  body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
  body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
  body('vehicleType').isString().isIn(['4-seater hatchback', '4-seater sedan', '7-seater SUV', '7-seater MUV']).withMessage('Invalid vehicle type'),
  body('rideDate').isString().notEmpty().withMessage('Ride date is required'),
  body('rideTime').isString().notEmpty().withMessage('Ride time is required'),
  rideController.createRideCash
);

// The old create route can be removed or commented out if not needed.
// router.post('/create', authMiddleware.authUser, ... , rideController.createRide);

// Other endpoints:
router.get('/captain/all', rideController.getAllRidesForCaptains);

router.get('/get-fare',
  authMiddleware.authUser,
  query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
  query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
  rideController.getFare
);

router.post('/confirm',
  authMiddleware.authCaptain,
  body('rideId').isMongoId().withMessage('Invalid ride id'),
  rideController.confirmRide
);

router.get('/start-ride',
  authMiddleware.authCaptain,
  query('rideId').isMongoId().withMessage('Invalid ride id'),
  query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
  rideController.startRide
);

router.post('/end-ride',
  authMiddleware.authCaptain,
  body('rideId').isMongoId().withMessage('Invalid ride id'),
  rideController.endRide
);

router.get('/:rideId', authMiddleware.authUser, rideController.getRideById);

router.get('/user/history', authMiddleware.authUser, rideController.getUserRideHistory);
router.get('/captain/history', authMiddleware.authCaptain, rideController.getCaptainRideHistory);

// Payment history for the logged in user
router.get("/payment-history", authMiddleware.authUser, async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find({ user: req.user._id })
      .populate("ride", "pickup destination rideDate rideTime fare");
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
