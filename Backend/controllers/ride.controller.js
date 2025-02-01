const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const fareData = await rideService.getFare(pickup, destination);
        console.log("Fare Data:", fareData); // Debugging

        if (!fareData[vehicleType]) {
            console.error("Invalid vehicle type or missing fare:", vehicleType);
            return res.status(400).json({ message: "Invalid vehicle type or fare calculation issue" });
        }

        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType,
            fare: fareData[vehicleType] // Ensure fare is passed
        });

        res.status(201).json({ ...ride.toObject(), otp: ride.otp });

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.ltd,
            pickupCoordinates.lng,
            2 // Radius in kilometers
        );

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.forEach((captain) => {
            if (captain.socketId) {
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser,
                });
            }
        });
    } catch (err) {
        console.error('Error creating ride:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        // Ensure the ride is assigned correctly
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        if (!ride) {
            return res.status(404).json({ message: "Ride not found or already assigned." });
        }

        // Ensure the ride has a valid user with a socket connection
        if (!ride.user || !ride.user.socketId) {
            return res.status(400).json({ message: "User socket ID is missing. Cannot confirm ride." });
        }

        // Send the confirmation message to the correct user
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: {
                rideId: ride._id,
                otp: ride.otp, // Ensure OTP is included
                captain: {
                    id: ride.captain._id,
                    name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`,
                    vehicle: ride.captain.vehicle,
                    profilePhoto: ride.captain.profilePhoto,
                    mobileNumber: ride.captain.mobileNumber
                },
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare
            }
        });

        return res.status(200).json({
            message: "Ride confirmed successfully",
            ride: {
                id: ride._id,
                captain: ride.captain,
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare
            }
        });

    } catch (err) {
        console.error("Error in confirmRide:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Backend/controllers/ride.controller.js
module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        // Ensure the ride exists and is assigned to this captain
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        if (!ride) {
            return res.status(404).json({ message: "Ride not found or already completed." });
        }

        // Ensure the ride has a valid user with a socket connection
        if (!ride.user || !ride.user.socketId) {
            return res.status(400).json({ message: "User socket ID is missing. Cannot send ride completion update." });
        }

        // Send a ride completion confirmation message to the user
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: {
                message: "Your ride has been successfully completed!",
                rideId: ride._id,
                fare: ride.fare,
                captain: {
                    id: ride.captain._id,
                    name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`,
                    vehicle: ride.captain.vehicle,
                    profilePhoto: ride.captain.profilePhoto
                },
                pickup: ride.pickup,
                destination: ride.destination,
                status: "completed"
            }
        });

        return res.status(200).json({
            message: "Ride ended successfully",
            ride: {
                id: ride._id,
                status: "completed",
                fare: ride.fare,
                captain: ride.captain,
                pickup: ride.pickup,
                destination: ride.destination
            }
        });

    } catch (err) {
        console.error("Error in endRide:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Backend/controllers/ride.controller.js
module.exports.getUserRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({ user: req.user._id })
            .populate('captain', 'fullname vehicle')
            .sort({ createdAt: -1 });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports.getCaptainRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({ captain: req.captain._id }).sort({ createdAt: -1 });
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.getRideById = async (req, res) => {
    try {
        const ride = await rideModel.findById(req.params.rideId)
            .populate('user')
            .populate('captain');
        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { input } = req.query;

        if (!input || input.length < 3) {
            return res.status(400).json({ message: 'Input must be at least 3 characters long' });
        }

        const suggestions = await mapService.getAutoCompleteSuggestions(input);
        res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};