const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
  firstname, lastname, email, password, color, plate, capacity, vehicleType, profilePhoto, mobileNumber, drivingLicense
}) => {
  if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType || !mobileNumber || !drivingLicense) {
    throw new Error('All fields are required');
  }
  const captain = await captainModel.create({
    fullname: {
      firstname,
      lastname
    },
    email,
    password,
    vehicle: {
      color,
      plate,
      capacity,
      vehicleType
    },
    profilePhoto,
    mobileNumber,
    drivingLicense,
    location: {
      type: 'Point',
      coordinates: [0, 0]
    }
  });

  return captain;
}