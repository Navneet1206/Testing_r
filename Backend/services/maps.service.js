const axios = require('axios');
const https = require('https');
const captainModel = require('../models/captain.model');
require('dotenv').config();

// Set up Axios options with a 15-second timeout.
let axiosOptions = {
  timeout: 15000, // 15-second timeout
};

// If running in Node (i.e. no window), force IPv4 and set a default User-Agent.
if (typeof window === 'undefined') {
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

  // Check if the input is a lat,lng pair (reverse geocoding) or an address.
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(trimmedInput)) {
    // Reverse geocoding
    url = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${encodeURIComponent(trimmedInput)}&key=${apiKey}`;
  } else {
    // Forward geocoding
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
    console.error('[maps.service] Error in getDistanceTime:', err.message);
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
    console.error('[maps.service] Error in getAutoCompleteSuggestions:', err.message);
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
            coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
          },
          $maxDistance: radius * 1000, // Convert radius (in km) to meters
        },
      },
    });
    return captains;
  } catch (err) {
    console.error('[maps.service] Error in getCaptainsInTheRadius:', err.message);
    throw new Error('Unable to fetch captains in the radius');
  }
};
