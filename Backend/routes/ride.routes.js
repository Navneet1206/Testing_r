const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post(
    "/create",
    authMiddleware.authUser,
    body("pickup").isString().isLength({ min: 3 }).withMessage("Invalid pickup address"),
    body("destination").isString().isLength({ min: 3 }).withMessage("Invalid destination address"),
    body("vehicleType")
      .isString()
      .isIn(["4-seater hatchback", "4-seater sedan", "7-seater SUV", "7-seater MUV"])
      .withMessage("Invalid vehicle type"),
    body("rideDate").isString().notEmpty().withMessage("Ride date is required"),
    body("rideTime").isString().notEmpty().withMessage("Ride time is required"),
    body("paymentType").isString().isIn(["cash", "online"]).withMessage("Invalid payment type"), // ✅ Fix: Ensure paymentType is included
    rideController.createRide
  );

  router.get('/captain/all', authMiddleware.authCaptain, rideController.getAllRidesForCaptains);



router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.get('/:rideId', authMiddleware.authUser, rideController.getRideById);

// Backend/routes/ride.routes.js
router.get('/user/history', authMiddleware.authUser, rideController.getUserRideHistory);
router.get('/captain/history', authMiddleware.authCaptain, rideController.getCaptainRideHistory);


module.exports = router;