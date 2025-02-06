const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blackListTokenModle = require("../models/blackListToken.model");
const { generateOTP } = require("../utils/otp.utils");
const { sendEmailOTP, sendSMSOTP } = require("../services/communication.service");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, mobileNumber } = req.body;
  const profilePhoto = req.file ? req.file.path : "";

  console.log("Registering user with data:", {
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    mobileNumber,
  });

  const hashedPassword = await userModel.hashPassword(password);

  const emailOTP = generateOTP();
  const mobileOTP = generateOTP();

  console.log("Generated Mobile OTP:", mobileOTP);
  console.log("Generated EMAIL OTP:", emailOTP);

  let formattedMobileNumber = mobileNumber.trim();
  if (!formattedMobileNumber.startsWith("+91")) {
    formattedMobileNumber = `+91${formattedMobileNumber}`;
  }

  try {
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

    console.log("OTP sent to email and mobile number");

    res.status(201).json({
      message: "OTP sent to email and mobile number",
      user: { email, mobileNumber: formattedMobileNumber },
    });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate key error:", error);
      let field = Object.keys(error.keyPattern)[0]; // Identify which field caused the error
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

  const normalizedOTP = otp.trim();
  const user = await userModel.findOne({ email }).select("+emailOTP");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const storedOTP = user.emailOTP.trim();

  console.log(`Stored OTP: ${storedOTP}, Entered OTP: ${normalizedOTP}`);

  if (String(storedOTP).trim() !== String(normalizedOTP).trim()) {
    console.log(`Email: ${email}, Entered OTP: ${normalizedOTP}, Stored OTP: ${storedOTP}`);
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.emailVerified = true;
  await user.save();

  console.log("Email verified successfully for:", email);

  res.status(200).json({ message: "Email verified successfully" });
};

module.exports.verifyMobileOTP = async (req, res, next) => {
  let { mobileNumber, otp } = req.body;

  console.log("Incoming Mobile OTP Verification Request:");
  console.log("Mobile Number:", mobileNumber);
  console.log("Entered OTP:", otp);

  if (!mobileNumber || !otp) {
    console.log("Mobile number or OTP missing in request.");
    return res.status(400).json({ message: "Mobile number and OTP are required" });
  }

  if (!mobileNumber.startsWith("+91")) {
    mobileNumber = `+91${mobileNumber.trim()}`;
  }

  console.log("Normalized Mobile Number for Query:", mobileNumber);

  try {
    const user = await userModel.findOne({ mobileNumber }).select("+mobileOTP");
    if (!user) {
      console.log("User not found for mobile number:", mobileNumber);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Stored OTP in DB:", user.mobileOTP);

    if (String(user.mobileOTP).trim() !== String(otp).trim()) {
      console.log(`OTP mismatch: Expected ${user.mobileOTP}, Received ${otp}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.mobileVerified = true;
    await user.save();

    console.log("Mobile number verified successfully for:", mobileNumber);

    res.status(200).json({ message: "Mobile number verified successfully" });
  } catch (error) {
    console.error("Error during mobile OTP verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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

  console.log("User logged in successfully:", email);

  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log("User not found in request.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Fetching user profile for:", req.user.email);

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "None" });

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
      await blackListTokenModel.create({ token });
  }

  console.log("User logged out successfully");
  return res.status(200).json({ message: "Logged out" });
};

