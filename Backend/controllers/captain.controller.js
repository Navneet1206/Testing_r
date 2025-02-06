const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const path = require("path");
const blackListTokenModel = require(path.resolve(__dirname, "../models/blackListToken.model.js"));
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP, sendSMSOTP } = require("../services/communication.service");
const rideModel = require("../models/ride.model");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle, mobileNumber, drivingLicense } = req.body;
  const profilePhoto = req.file ? req.file.path : "";

  const hashedPassword = await captainModel.hashPassword(password);

  const emailOTP = generateOTP();
  const mobileOTP = generateOTP();

  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith("+91")) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  try {
    const captain = await captainService.createCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
      profilePhoto,
      mobileNumber: formattedMobileNumber,
      drivingLicense,
      emailOTP,
      mobileOTP,
    });

    await sendEmailOTP(email, emailOTP);
    await sendSMSOTP(formattedMobileNumber, mobileOTP);

    res.status(201).json({
      message: "OTP sent to email and mobile number",
      captain: { email, mobileNumber: formattedMobileNumber },
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate key error:", error);
      let field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `Duplicate value found for ${field}. Please use a different ${field}.`,
      });
    }
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.verifyEmailOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  // Trim and normalize OTP
  const normalizedOTP = otp.trim();

  const captain = await captainModel.findOne({ email }).select("+emailOTP");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  // Trim and normalize stored OTP
  const storedOTP = captain.emailOTP.trim();

  // Debugging: Log the OTPs
  console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (String(storedOTP).trim() !== String(normalizedOTP).trim()) {
    return res.status(400).json({ message: "Invalid OTP" });
}

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({ message: "Email verified successfully" });
};

module.exports.verifyMobileOTP = async (req, res, next) => {
  let { mobileNumber, otp } = req.body;

  // Debugging: Log incoming request data
  console.log("Incoming Mobile OTP Verification Request for Captain:");
  console.log("Mobile Number:", mobileNumber);
  console.log("Entered OTP:", otp);

  // Check if both mobileNumber and OTP are provided
  if (!mobileNumber || !otp) {
    console.log("Mobile number or OTP missing in request.");
    return res.status(400).json({ message: "Mobile number and OTP are required" });
  }

  // Normalize mobile number to include country code (+91 for India)
  if (!mobileNumber.startsWith("+91")) {
    mobileNumber = `+91${mobileNumber.trim()}`;
  }

  // Debugging: Log normalized mobile number
  console.log("Normalized Mobile Number for Query:", mobileNumber);

  try {
    // Find the captain by the normalized mobile number
    const captain = await captainModel.findOne({ mobileNumber }).select("+mobileOTP");
    if (!captain) {
      console.log("Captain not found for mobile number:", mobileNumber);
      return res.status(404).json({ message: "Captain not found" });
    }

    // Debugging: Log stored OTP
    console.log("Stored OTP in DB for Captain:", captain.mobileOTP);

    // Validate OTP
    if (String(captain.mobileOTP).trim() !== String(otp).trim()) {
      console.log(`OTP mismatch: Expected ${captain.mobileOTP}, Received ${otp}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the mobile number as verified
    captain.mobileVerified = true;
    await captain.save();

    console.log("Mobile number verified successfully for Captain:", mobileNumber);
    return res.status(200).json({ message: "Mobile number verified successfully" });
  } catch (error) {
    // Debugging: Log any unexpected errors
    console.error("Error during Captain mobile OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!captain.emailVerified || !captain.mobileVerified) {
    return res.status(401).json({ message: "Please verify your email and mobile number" });
  }

  const token = captain.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, captain });
};

module.exports.getCaptainProfile = async (req, res, next) => {
  if (!req.captain) {
    console.log('No captain found in request');
    return res.status(404).json({ message: 'Captain not found' });
  }

  console.log('Returning captain profile:', req.captain);
  res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
      await blackListTokenModel.create({ token });
  }

  console.log("Captain logged out successfully");
  return res.status(200).json({ message: "Logged out" });
};


// module.exports.getCaptainDashboard = async (req, res) => {
//   try {
//     const { captainId } = req.params;

//     // Fetch captain details
//     const captain = await captainModel.findById(captainId);

//     if (!captain) {
//       return res.status(404).json({ message: "Captain not found" });
//     }

//     // Fetch total earnings and rides data
//     const rides = await rideModel.find({ captain: captainId });
//     const totalEarnings = rides.reduce((sum, ride) => sum + ride.fare, 0);

//     res.status(200).json({
//       fullname: captain.fullname,
//       profilePhoto: captain.profilePhoto,
//       totalEarnings,
//       ridesCompleted: rides.length,
//       location: captain.location,
//     });
//   } catch (error) {
//     console.error("Error fetching captain dashboard data:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };