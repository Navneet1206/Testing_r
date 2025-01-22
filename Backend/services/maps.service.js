const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOMAPPRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng,
                formatted_address: response.data.results[0].formatted_address,
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOMAPPRO_API_KEY;
    if (!apiKey) {
        throw new Error('API key is missing');
    }

    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('API Response:', response.data); // Log the response for debugging

        if (response.data.status !== 'OK') {
            throw new Error(`API Error: ${response.data.status}`);
        }

        const element = response.data.rows[0]?.elements[0];
        if (!element) {
            throw new Error('No route data found');
        }

        if (element.status === 'ZERO_RESULTS') {
            throw new Error('No routes found between the specified locations');
        }

        return element; // Return the element containing distance and duration
    } catch (err) {
        console.error('Error in getDistanceTime:', err.message);
        throw new Error('Failed to fetch distance and time');
    }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Input is required');
    }

    const apiKey = process.env.GOMAPPRO_API_KEY;
    if (!apiKey) {
        throw new Error('API key is missing');
    }

    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('API Response:', response.data); // Log the response for debugging

        if (response.data.status !== 'OK') {
            throw new Error(`API Error: ${response.data.status}`);
        }

        if (!response.data.predictions) {
            throw new Error('No predictions found in the API response');
        }

        return response.data.predictions.map(prediction => prediction.description);
    } catch (err) {
        console.error('Error in getAutoCompleteSuggestions:', err.message);
        throw new Error('Failed to fetch suggestions');
    }
};

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    try {
        // Fetch captains within the specified radius
        const captains = await captainModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    $maxDistance: radius * 1000, // Convert radius to meters
                },
            },
        });

        return captains;
    } catch (err) {
        console.error(err);
        throw new Error('Unable to fetch captains in the radius');
    }
};
module.exports.getRoute = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOMAPPRO_API_KEY;
    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.status === 'OK') {
            const route = response.data.routes[0]; // Fetch the first route
            return route; // Return the route object
        } else {
            throw new Error('Unable to fetch route');
        }
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching route data');
    }
};
