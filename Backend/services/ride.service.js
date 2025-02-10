// Backend/services/ride.service.js
const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  try {
    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    
    if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
      throw new Error('Invalid response from GoMaps API');
    }
    
    console.log("Distance & Time Data:", distanceTime);

    const baseFare = { 
      '4-seater hatchback': 30, 
      '4-seater sedan': 35, 
      '7-seater SUV': 50, 
      '7-seater MUV': 55 
    };
    const perKmRate = { 
      '4-seater hatchback': 10, 
      '4-seater sedan': 12, 
      '7-seater SUV': 15, 
      '7-seater MUV': 18 
    };
    const perMinuteRate = { 
      '4-seater hatchback': 2, 
      '4-seater sedan': 2.5, 
      '7-seater SUV': 3, 
      '7-seater MUV': 3.5 
    };

    const fare = {};
    for (const type in baseFare) {
      fare[type] = Math.round(
        baseFare[type] +
        ((distanceTime.distance.value / 1000) * perKmRate[type]) +
        ((distanceTime.duration.value / 60) * perMinuteRate[type])
      );
    }
    console.log("Calculated Fare:", fare);
    return fare;
  } catch (error) {
    console.error('Error in fare calculation:', error.message);
    throw new Error('Fare calculation failed');
  }
}

module.exports.getFare = getFare;

function getOtp(num) {
  // Generate a numeric OTP of length `num`
  return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

/**
 * Updated createRide function:
 * Accepts an object that can include additional fields such as status, paymentType, and isPaymentDone.
 */
module.exports.createRide = async (rideData) => {
  if (
    !rideData.user ||
    !rideData.pickup ||
    !rideData.destination ||
    !rideData.vehicleType ||
    !rideData.rideDate ||
    !rideData.rideTime
  ) {
    throw new Error('All fields are required');
  }
  
  // If fare is not passed explicitly, calculate it.
  const fareData = await getFare(rideData.pickup, rideData.destination);
  const fare = rideData.fare || fareData[rideData.vehicleType];
  
  const ride = await rideModel.create({
    user: rideData.user,
    pickup: rideData.pickup,
    destination: rideData.destination,
    rideDate: rideData.rideDate,
    rideTime: rideData.rideTime,
    otp: getOtp(6),
    fare: fare,
    status: rideData.status || 'pending',
    paymentType: rideData.paymentType,     // "online" or "cash"
    isPaymentDone: rideData.isPaymentDone,   // true or false
  });
  
  return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, {
    status: 'accepted',
    captain: captain._id
  });
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error('Ride id and OTP are required');
  }
  const ride = await rideModel.findOne({ _id: rideId })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'accepted') {
    throw new Error('Ride not accepted');
  }
  if (ride.otp !== otp) {
    throw new Error('Invalid OTP');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'ongoing' });
  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error('Ride id is required');
  }
  const ride = await rideModel.findOne({ _id: rideId, captain: captain._id })
    .populate('user')
    .populate('captain')
    .select('+otp');
  if (!ride) {
    throw new Error('Ride not found');
  }
  if (ride.status !== 'ongoing') {
    throw new Error('Ride not ongoing');
  }
  await rideModel.findOneAndUpdate({ _id: rideId }, { status: 'completed' });
  return ride;
};
