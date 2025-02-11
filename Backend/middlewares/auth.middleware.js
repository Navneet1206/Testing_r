const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require("../models/blackListToken.model");
const captainModel = require('../models/captain.model');
const Admin = require('../models/admin.model');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id)

        if (!user) {
            return res.status(401).json({ message: "User not found" });
          }

        req.user = user;

        next();

    } catch (err) {
        console.error("Error in auth middleware:", err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) {
        console.log('❌ Token is blacklisted');
        return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Decoded token:', decoded);

        const captain = await captainModel.findById(decoded._id);
        
        if (!captain) {
            console.log('⚠️ Captain not found, proceeding without error.');
            req.captain = null; // ✅ No error, request will proceed
        } else {
            req.captain = captain;
        }

        next();
    } catch (err) {
        console.error('❌ Error in authCaptain middleware:', err);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};



  
  
module.exports.authAdmin = async (req, res, next) => {
    // Admin token usually comes from Authorization header (Bearer token)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded._id);
      if (!admin) return res.status(401).json({ message: "Unauthorized" });
      
      req.admin = admin; // Optional: attach admin object to req
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };