const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mapController = require('../controllers/map.controller');
const { query } = require('express-validator');

router.get('/get-coordinates',
    query('address').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getCoordinates
);

router.get('/get-distance-time',
    query('origin').isString().isLength({ min: 3 }),
    query('destination').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getDistanceTime
)

router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapController.getAutoCompleteSuggestions
)

router.get('/get-route',
    query('origin').isString().isLength({ min: 3 }).withMessage('Invalid origin'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination'),
    authMiddleware.authUser,
    async (req, res) => {
        const { origin, destination } = req.query;

        try {
            const route = await mapService.getRoute(origin, destination); // Use the new service
            res.status(200).json(route); // Send the full route object
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);


module.exports = router;