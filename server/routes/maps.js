import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

const GOMAP_API_KEY = process.env.GOMAP_API_KEY;
const GOMAP_BASE_URL = 'https://maps.gomaps.pro/maps/api';

// Geocode address to coordinates
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    const response = await axios.get(`${GOMAP_BASE_URL}/geocode/json`, {
      params: {
        address,
        key: GOMAP_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error('Geocoding failed');
    }

    const location = response.data.results[0].geometry.location;
    res.json({
      address: response.data.results[0].formatted_address,
      coordinates: [location.lat, location.lng]
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ message: 'Failed to geocode address' });
  }
});

// Reverse geocode coordinates to address
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const response = await axios.get(`${GOMAP_BASE_URL}/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOMAP_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error('Reverse geocoding failed');
    }

    res.json({
      address: response.data.results[0].formatted_address
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ message: 'Failed to reverse geocode coordinates' });
  }
});

// Get route details between two points
router.post('/route', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    const response = await axios.get(`${GOMAP_BASE_URL}/directions/json`, {
      params: {
        origin: `${origin[0]},${origin[1]}`,
        destination: `${destination[0]},${destination[1]}`,
        key: GOMAP_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error('Route calculation failed');
    }

    const route = response.data.routes[0];
    res.json({
      distance: route.legs[0].distance.value / 1000, // Convert to kilometers
      duration: route.legs[0].duration.value, // Duration in seconds
      polyline: route.overview_polyline.points
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate route' });
  }
});

export default router;