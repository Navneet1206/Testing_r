const crypto = require('crypto');

module.exports.generateOTP = (length = 6) => {
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
    return otp.padStart(length, '0'); 
};
