const axios = require('axios');
const captainModel = require('../models/captain.model');

let axiosOptions = {
  timeout: 15000, // 15-second timeout
};
console.log("Hello", typeof window)
if (typeof window === 'undefined') {
  const https = require('https');
  axiosOptions.httpsAgent = new https.Agent({ family: 4 });
  axiosOptions.headers = {
    'User-Agent': 'Mozilla/5.0'
  };
}

const axiosInstance = axios.create(axiosOptions);

module.exports.getAddressCoordinate = async (input) => {
  const apiKey = process.env.GOMAPPRO_API_KEY;
  if (!apiKey) {
    throw new Error('GOMAPPRO_API_KEY is not set in the environment');
  }

  const trimmedInput = input.trim();
  let url = '';

  // Check if the input is a lat,lng pair (reverse geocoding)
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(trimmedInput)) {
    url = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${encodeURIComponent(trimmedInput)}&key=${apiKey}`;
  } else {
    url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(trimmedInput)}&key=${apiKey}`;
  }

  console.log('[maps.service] Request URL:', url);

  try {
    const response = await axiosInstance.get(url);
    console.log('[maps.service] API response:', response.data);
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        ltd: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    } else {
      throw new Error(response.data.error_message || 'Unable to fetch coordinates');
    }
  } catch (error) {
    console.error('[maps.service] Error:', error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  const apiKey = process.env.GOMAPPRO_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axiosInstance.get(url);
    if (response.data.status === 'OK') {
      if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
        throw new Error('No routes found');
      }
      return response.data.rows[0].elements[0];
    } else {
      throw new Error('Unable to fetch distance and time');
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error('Input is required');
  }

  const apiKey = process.env.GOMAPPRO_API_KEY;
  const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

  try {
    const response = await axiosInstance.get(url);
    if (response.data.status === 'OK') {
      return response.data.predictions.map(prediction => prediction.description);
    } else {
      throw new Error('Unable to fetch suggestions');
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
  try {
    const captains = await captainModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      },
    });
    return captains;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to fetch captains in the radius');
  }
};
