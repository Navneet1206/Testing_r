const adminService = require('../services/admin.service');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const rideModel = require('../models/ride.model');
const paymentModel = require('../models/PaymentTransaction.model');

module.exports.adminLogin = async (req, res) => {
  try {
    const token = await adminService.authenticateAdmin(req.body);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalCaptains = await captainModel.countDocuments();
    const pendingRides = await rideModel.countDocuments({ status: 'pending' });
    const completedRides = await rideModel.countDocuments({ status: 'completed' });
    const totalEarnings = await paymentModel.aggregate([
      { $match: { paymentStatus: 'done' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({ totalUsers, totalCaptains, pendingRides, completedRides, totalEarnings: totalEarnings[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.blockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.unblockUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
