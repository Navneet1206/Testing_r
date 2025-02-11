const Admin = require('../models/admin.model');

module.exports.createAdmin = async ({ email, password }) => {
  const hashedPassword = await Admin.hashPassword(password);
  return await Admin.create({ email, password: hashedPassword });
};

module.exports.authenticateAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) throw new Error('Admin not found');
  
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  return admin.generateAuthToken();
};
