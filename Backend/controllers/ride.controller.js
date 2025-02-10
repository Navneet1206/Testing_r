// Backend/controllers/ride.controller.js
const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const userModel = require('../models/user.model');
const dotenv = require('dotenv');
const { sendEmail } = require('../services/communication.service');
const { sendMessageToSocketId } = require('../socket');
const captainModel = require('../models/captain.model');
const Razorpay = require("razorpay");
const PaymentTransaction = require("../models/PaymentTransaction.model");

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Endpoint: Initiate Payment Order for Online Payment
 * This endpoint calculates the fare and creates a Razorpay order.
 */
module.exports.initiatePaymentOrder = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { pickup, destination, vehicleType, rideDate, rideTime } = req.body;
  try {
    const fareData = await rideService.getFare(pickup, destination);
    const amount = fareData[vehicleType];
    
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    // Return order details along with fare and ride details for frontend processing.
    res.status(200).json({
      order,
      fare: amount,
      rideDetails: { pickup, destination, vehicleType, rideDate, rideTime }
    });
  } catch(err){
    console.error("Error initiating payment order:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Endpoint: Confirm Online Payment and Create Ride
 * Call this after the frontend completes payment using Razorpay.
 * It creates the ride (with payment marked as done), logs a payment transaction, and sends email notifications.
 */
module.exports.confirmOnlineRide = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Expected fields: razorpay_payment_id, razorpay_order_id, pickup, destination, vehicleType, rideDate, rideTime
  const { razorpay_payment_id, razorpay_order_id, pickup, destination, vehicleType, rideDate, rideTime } = req.body;
  try {
    const fareData = await rideService.getFare(pickup, destination);
    const fare = fareData[vehicleType];
    
    // Create ride with online payment details (payment is completed)
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
      rideDate,
      rideTime,
      fare: fare,
      status: "pending",
      paymentType: "online",
      isPaymentDone: true,
    });
    
    // Log the payment transaction
    await PaymentTransaction.create({
      ride: ride._id,
      user: req.user._id,
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: fare,
      paymentMethod: "online",
      paymentStatus: "done",
    });
    
    // Notify all captains via socket
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE;
    const captains = await captainModel.find();
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
            fare,
            status: "pending",
            adminEmail,
            adminPhone
          }
        });
      }
    });
    
    // Prepare email notification content
    const user = await userModel.findById(req.user._id);
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ride Request Confirmed (Online Payment)</title>
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
              <div class="email-header">Ride Request Confirmed (Online Payment)</div>
              <div class="email-content">
                  <div class="info-row">
                      <span class="info-label">User</span>
                      <span class="info-value">${user.fullname.firstname} ${user.fullname.lastname}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Email</span>
                      <span class="info-value">${user.email}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Phone</span>
                      <span class="info-value">${user.mobileNumber}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Pickup</span>
                      <span class="info-value">${pickup}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Destination</span>
                      <span class="info-value">${destination}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Date</span>
                      <span class="info-value">${rideDate}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Time</span>
                      <span class="info-value">${rideTime}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Fare</span>
                      <span class="info-value">₹${fare}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Payment ID</span>
                      <span class="info-value">${razorpay_payment_id}</span>
                  </div>
              </div>
              <div class="email-footer">Ride Request Confirmation</div>
          </div>
      </body>
      </html>
    `;
    
    await sendEmail(adminEmail, 'New Ride Request with Payment', emailContent);
    await sendEmail(user.email, 'Ride Confirmed with Payment', emailContent);
    
    res.status(201).json({ message: "Ride confirmed and payment completed", ride });
  } catch (err) {
    console.error("Error confirming online ride:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * Endpoint: Create Ride for Cash Payment
 * For cash, create the ride immediately with paymentType 'cash' and payment marked as not done.
 */
module.exports.createRideCash = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { pickup, destination, vehicleType, rideDate, rideTime } = req.body;
  try {
    const fareData = await rideService.getFare(pickup, destination);
    const fare = fareData[vehicleType];
    
    // Create ride with cash payment details
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
      rideDate,
      rideTime,
      fare: fare,
      status: "pending",
      paymentType: "cash",
      isPaymentDone: false,
    });
    
    // Log the cash payment transaction (payment pending)
    await PaymentTransaction.create({
      ride: ride._id,
      user: req.user._id,
      amount: fare,
      paymentMethod: "cash",
      paymentStatus: "not_done",
    });
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPhone = process.env.ADMIN_PHONE;
    
    // Notify captains via socket
    const captains = await captainModel.find();
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
            fare,
            status: "pending",
            adminEmail,
            adminPhone
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
          <title>Ride Request Confirmed (Cash Payment)</title>
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
              <div class="email-header">Ride Request Confirmed (Cash Payment)</div>
              <div class="email-content">
                  <div class="info-row">
                      <span class="info-label">User</span>
                      <span class="info-value">${user.fullname.firstname} ${user.fullname.lastname}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Email</span>
                      <span class="info-value">${user.email}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Phone</span>
                      <span class="info-value">${user.mobileNumber}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Pickup</span>
                      <span class="info-value">${pickup}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Destination</span>
                      <span class="info-value">${destination}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Date</span>
                      <span class="info-value">${rideDate}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Time</span>
                      <span class="info-value">${rideTime}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Fare</span>
                      <span class="info-value">₹${fare}</span>
                  </div>
                  <div class="info-row">
                      <span class="info-label">Payment</span>
                      <span class="info-value">Cash (Payment Pending)</span>
                  </div>
              </div>
              <div class="email-footer">Ride Request Confirmation</div>
          </div>
      </body>
      </html>
    `;
    
    await sendEmail(adminEmail, 'New Ride Request (Cash Payment)', emailContent);
    await sendEmail(user.email, 'Ride Request Confirmed', emailContent);
    
    res.status(201).json({ message: "Ride created with cash payment", ride });
  } catch (err) {
    console.error("Error creating cash ride:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
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
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rideId } = req.body;
  try {
    const ride = await rideService.confirmRide({ rideId, captain: req.captain });
    sendMessageToSocketId(ride.user.socketId, {
      event: 'ride-confirmed',
      data: {
        ...ride.toObject(),
        otp: ride.otp,
        captain: ride.captain,
      }
    });
    return res.status(200).json(ride);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
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
    sendMessageToSocketId(ride.user.socketId, {
      event: 'ride-started',
      data: ride
    });
    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

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
};

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
    const rides = await rideModel.find().select("pickup destination rideDate rideTime fare status");
    res.status(200).json(rides);
  } catch (err) {
    console.error("Error fetching rides:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
