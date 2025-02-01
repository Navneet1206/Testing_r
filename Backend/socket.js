const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle user/captain joining
        socket.on('join', async (data) => {
            try {
                const { userId, userType } = data;
        
                if (userType === 'captain') {
                    const updatedCaptain = await captainModel.findByIdAndUpdate(userId, { 
                        socketId: socket.id,
                        status: 'active'
                    }, { new: true });
        
                    if (!updatedCaptain) {
                        console.log("Captain not found");
                        return socket.emit("error", { message: "Captain not found" });
                    }
        
                    console.log(`Captain ${updatedCaptain.fullname.firstname} is now active`);
                } else if (userType === 'rider') {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                }
            } catch (error) {
                console.error('Error updating socket ID:', error);
                socket.emit('error', { message: 'Failed to update socket ID' });
            }
        });
        

        // Handle captain location updates
        socket.on('update-location-captain', async (data) => {
            try {
                const { captainId, location } = data;
        
                if (!location || !location.ltd || !location.lng) {
                    return socket.emit('error', { message: 'Invalid location data' });
                }
        
                console.log(`Updating location for Captain ${captainId}:`, location);
        
                // Update captain's location in the database
                const updatedCaptain = await captainModel.findByIdAndUpdate(captainId, {
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.ltd],
                    },
                }, { new: true });
        
                if (!updatedCaptain) {
                    return socket.emit('error', { message: 'Captain not found' });
                }
        
                console.log(`New location stored in DB:`, updatedCaptain.location);
        
                // Find the active ride for this captain
                const activeRide = await rideModel.findOne({
                    captain: captainId,
                    status: { $in: ['ongoing', 'accepted'] } // Active ride statuses
                }).populate('user');
        
                if (!activeRide) {
                    return socket.emit('error', { message: 'No active ride found for this captain' });
                }
        
                // Send location update ONLY to the user who booked the ride
                if (activeRide.user && activeRide.user.socketId) {
                    console.log(`Sending location to user ${activeRide.user.socketId}`);
                    io.to(activeRide.user.socketId).emit('captain-location-update', { captainId, location });
                }
        
            } catch (error) {
                console.error('Error updating captain location:', error);
                socket.emit('error', { message: 'Failed to update location' });
            }
        });
        
        

        // Handle client disconnection
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
            try {
                // Remove socketId from the captain or user document
                await captainModel.findOneAndUpdate({ socketId: socket.id }, { $unset: { socketId: 1 } });
                await userModel.findOneAndUpdate({ socketId: socket.id }, { $unset: { socketId: 1 } });
            } catch (error) {
                console.error('Error cleaning up socket ID:', error);
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
};

module.exports = { initializeSocket, sendMessageToSocketId };
