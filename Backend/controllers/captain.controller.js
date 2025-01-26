const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP, sendSMSOTP } = require("../services/communication.service");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle, mobileNumber, drivingLicense } = req.body;
  const profilePhoto = req.file ? req.file.path : "";

  const isCaptainAlreadyExist = await captainModel.findOne({ email });

  if (isCaptainAlreadyExist) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const emailOTP = generateOTP();
  const mobileOTP = generateOTP();

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
    mobileNumber,
    drivingLicense,
    emailOTP,
    mobileOTP,
  });

  await sendEmailOTP(email, emailOTP);
  await sendSMSOTP(mobileNumber, mobileOTP);

  res.status(201).json({
    message: "OTP sent to email and mobile number",
    captain: { email, mobileNumber },
  });
};


module.exports.verifyEmailOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const captain = await captainModel.findOne({ email }).select("+emailOTP");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  if (captain.emailOTP !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({ message: "Email verified successfully" });
};

module.exports.verifyMobileOTP = async (req, res, next) => {
  const { mobileNumber, otp } = req.body;

  const captain = await captainModel.findOne({ mobileNumber }).select("+mobileOTP");

  if (!captain) {
    return res.status(404).json({ message: "Captain not found" });
  }

  if (captain.mobileOTP !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  captain.mobileVerified = true;
  await captain.save();

  res.status(200).json({ message: "Mobile number verified successfully" });
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
  res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blackListTokenModel.create({ token });

  res.clearCookie("token");

  res.status(200).json({ message: "Logout successfully" });
};