// Backend/services/user.service.js
const userModel = require("../models/user.model");

module.exports.createUser = async ({
  firstname,
  lastname,
  email,
  password,
  profilePhoto,
  mobileNumber,
  emailOTP,
  mobileOTP,
}) => {
  if (!firstname || !email || !password || !mobileNumber) {
    throw new Error("All fields are required");
  }
  const user = await userModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password,
    profilePhoto,
    mobileNumber,
    emailOTP,
    mobileOTP,
  });

  return user;
};