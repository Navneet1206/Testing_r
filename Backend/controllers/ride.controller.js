const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const dotenv = require('dotenv');
const { sendEmail } = require('../services/communication.service');
const { sendMessageToSocketId } = require('../socket');
const captainModel = require('../models/captain.model');

dotenv.config();

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { pickup, destination, vehicleType, rideDate, rideTime, paymentType } = req.body;
    if (!paymentType) {
        return res.status(400).json({ message: "Payment type is required (cash/online)" });
      }
  
    try {
      const fareData = await rideService.getFare(pickup, destination);
      
      const ride = await rideService.createRide({
        user: req.user._id,
        pickup,
        destination,
        vehicleType,
        rideDate,
        rideTime,
        paymentType,
        fare: fareData[vehicleType],
        status: "pending"
      });
  
      // ✅ Declare admin variables before using them
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPhone = process.env.ADMIN_PHONE;
  
      // 🛠 Get all captains
      const captains = await captainModel.find(); // ✅ Get all captains, even offline ones
      captains.forEach(captain => {
          if (captain.socketId) {
            sendMessageToSocketId(captain.socketId, {
              event: 'new-ride',
              data: { 
                  rideId: ride._id,
                  pickup,
                  destination,
                  rideDate,
                  rideTime,
                  fare: fareData[vehicleType],
                  status: "pending",
                  adminEmail,  // ✅ Now it's declared before usage
                  adminPhone   // ✅ Now it's declared before usage
              }
            });
          }
      });
  
      const user = await userModel.findById(req.user._id);
  
      const emailContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Ride Request</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; }
                .email-container { background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .email-header { background-color: #2563eb; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
                .email-content { padding: 20px; }
                .info-row { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
                .info-label { color: #4b5563; font-weight: 600; }
                .info-value { color: #111827; text-align: right; }
                .fare-row { display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; }
                .fare-value { color: #10b981; font-size: 20px; }
                .email-footer { background-color: #f9fafb; text-align: center; padding: 10px; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">New Ride Request</div>
                <div class="email-content">
                    <div class="info-row">
                        <span class="info-label">User</span>
                        <span class="info-value">&nbsp;&nbsp;${user.fullname.firstname} ${user.fullname.lastname}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value">&nbsp;&nbsp;${user.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone</span>
                        <span class="info-value">&nbsp;&nbsp;${user.mobileNumber}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Pickup</span>
                        <span class="info-value">&nbsp;&nbsp;${pickup}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Destination</span>
                        <span class="info-value">&nbsp;&nbsp;${destination}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="info-value">&nbsp;&nbsp;${rideDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Time:</span>
                        <span class="info-value">&nbsp;&nbsp;${rideTime}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">OTP:</span>
                        <span class="info-value">&nbsp;&nbsp;${ride.otp}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vehicle Type</span>
                        <span class="info-value">&nbsp;&nbsp;${vehicleType}</span>
                    </div>
                    <div class="fare-row">
                        <span>Fare</span>
                        <span class="fare-value">&nbsp;&nbsp;₹${fareData[vehicleType]}</span>
                    </div>
                </div>
                <div class="email-footer">Ride Request Confirmation</div>
            </div>
        </body>
        </html>
      `;
  
      await sendEmail(adminEmail, 'New Ride Request', emailContent);
      await sendEmail(user.email, 'Thanks for Ride Request', emailContent);
      
      res.status(201).json({ 
        message: "Ride request sent to admin for approval",
        ride
      });
  
    } catch (err) {
      console.error('Error creating ride:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const { rideId, paymentType, paymentDetails } = req.body;
  
    try {
      const ride = await Ride.findById(rideId).populate("user");
      if (!ride) return res.status(404).json({ message: "Ride not found" });
  
      if (paymentType === "cash") {
        ride.isPaymentDone = false;
        ride.paymentType = "cash";
        await ride.save();
      } else if (paymentType === "online") {
        const result = await paymentService.verifyPayment(
          rideId,
          paymentDetails.orderId,
          paymentDetails.transactionId
        );
  
        ride.isPaymentDone = true;
        ride.paymentType = "online";
        await ride.save();
      } else {
        return res.status(400).json({ message: "Invalid payment type" });
      }
  
      // 📧 Send Confirmation Email
      const emailContent = `
        <p>Your ride has been confirmed.</p>
        <p>Payment Status: ${ride.isPaymentDone ? "Done" : "Not Done"}</p>
        <p>Amount: ₹${ride.fare}</p>
      `;
      await sendEmail(ride.user.email, "Ride Confirmation", emailContent);
      await sendEmail(process.env.ADMIN_EMAIL, "New Ride Payment", emailContent);
  
      res.status(200).json({ message: "Ride confirmed successfully", ride });
    } catch (error) {
      console.error("Error confirming ride:", error);
      res.status(500).json({ message: "Error confirming ride" });
    }
  };
  

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Backend/controllers/ride.controller.js
module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Backend/controllers/ride.controller.js
module.exports.getUserRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({ user: req.user._id })
            .populate('captain', 'fullname vehicle')
            .sort({ createdAt: -1 });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports.getCaptainRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({ captain: req.captain._id }).sort({ createdAt: -1 });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.getRideById = async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.rideId)
            .populate('user')
            .populate('captain');
        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { input } = req.query;

        if (!input || input.length < 3) {
            return res.status(400).json({ message: 'Input must be at least 3 characters long' });
        }

        const suggestions = await mapService.getAutoCompleteSuggestions(input);
        res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getAllRidesForCaptains = async (req, res) => {
    try {
      const rides = await rideModel.find().select("pickup destination rideDate rideTime fare status"); // ✅ Fetch rides without user details
    
      res.status(200).json(rides);
    } catch (err) {
      console.error("Error fetching rides:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  