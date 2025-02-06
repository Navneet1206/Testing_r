const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');
const { query } = require('express-validator');

router.get(
    '/get-coordinates',
    // Validate that address is a string and has at least 3 characters
    query('address').isString().isLength({ min: 3 }).withMessage('Invalid address'),
    authMiddleware.authUser,  // For testing, you might comment this out
    mapController.getCoordinates
  );
  

  router.get(
    '/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
  );

  router.get(
    '/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getAutoCompleteSuggestions
  );

  

module.exports = router;