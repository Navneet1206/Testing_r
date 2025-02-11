const Admin = require('../models/admin.model');
const bcrypt = require('bcrypt'); // ✅ Import bcrypt
const jwt = require('jsonwebtoken'); // ✅ Import jsonwebtoken

module.exports.createAdmin = async ({ email, password }) => {
  const hashedPassword = await Admin.hashPassword(password);
  return await Admin.create({ email, password: hashedPassword });
};

module.exports.authenticateAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select("+password"); // ✅ Ensure password is fetched
  console.log("🛠 Admin Found:", admin); // ✅ Debugging
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  console.log("🛠 Password Match:", isMatch); // ✅ Debugging
  if (!isMatch) throw new Error("Invalid credentials");

  // ✅ Generate JWT token manually
  const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  return token;
};