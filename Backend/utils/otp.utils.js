// Backend/utils/otp.utils.js
const crypto = require('crypto');

function generateOTP(length = 6) {
    return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

module.exports = { generateOTP };