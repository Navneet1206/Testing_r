const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP, sendSMSOTP } = require("../services/communication.service");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, mobileNumber } = req.body;
  const profilePhoto = req.file ? req.file.path : "";

  // Debugging: Log the request data
  console.log("Registering user with data:", {
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    mobileNumber,
  });

  const isUserAlready = await userModel.findOne({ email });

  if (isUserAlready) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await userModel.hashPassword(password);

  const emailOTP = generateOTP();
  const mobileOTP = generateOTP();

  // Ensure mobile number starts with +91
  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith('+91')) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    profilePhoto,
    mobileNumber: formattedMobileNumber,
    emailOTP,
    mobileOTP,
  });

  await sendEmailOTP(email, emailOTP);
  await sendSMSOTP(formattedMobileNumber, mobileOTP);

  res.status(201).json({
    message: "OTP sent to email and mobile number",
    user: { email, mobileNumber: formattedMobileNumber },
  });
};


module.exports.verifyEmailOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  // Trim and normalize OTP
  const normalizedOTP = otp.trim();

  const user = await userModel.findOne({ email }).select("+emailOTP");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Trim and normalize stored OTP
  const storedOTP = user.emailOTP.trim();

  // Debugging: Log the OTPs
  console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (storedOTP !== normalizedOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.emailVerified = true;
  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
};

module.exports.verifyMobileOTP = async (req, res, next) => {
  const { mobileNumber, otp } = req.body;

  // Trim and normalize OTP
  const normalizedOTP = otp.trim();

  const user = await userModel.findOne({ mobileNumber }).select("+mobileOTP");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Trim and normalize stored OTP
  const storedOTP = user.mobileOTP.trim();

  // Debugging: Log the OTPs
  console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (storedOTP !== normalizedOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.mobileVerified = true;
  await user.save();

  res.status(200).json({ message: "Mobile number verified successfully" });
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.emailVerified || !user.mobileVerified) {
    return res.status(401).json({ message: "Please verify your email and mobile number" });
  }

  const token = user.generateAuthToken();

  res.cookie("token", token);

  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blackListTokenModel.create({ token });

  res.status(200).json({ message: "Logged out" });
};