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
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
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
                const { userId, location } = data;

                if (!location || !location.ltd || !location.lng) {
                    return socket.emit('error', { message: 'Invalid location data' });
                }

                await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.ltd], // GeoJSON format: [longitude, latitude]
                    },
                });

                // Broadcast the updated location to all connected clients
                io.emit('captain-location-update', { userId, location });
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

    
    // Add these events to the existing socket.io connection
socket.on('start-ride', async (data) => {
    try {
      const { rideId } = data;
      const ride = await rideModel.findById(rideId)
        .populate('user captain')
        .lean();
      
      // Get coordinates for the route
      const pickupCoords = await mapService.getAddressCoordinate(ride.pickup);
      const destCoords = await mapService.getAddressCoordinate(ride.destination);
  
      // Emit route data to both parties
      io.to(ride.user.socketId).emit('ride-route', {
        pickup: pickupCoords,
        destination: destCoords
      });
      
      io.to(ride.captain.socketId).emit('ride-route', {
        pickup: pickupCoords,
        destination: destCoords
      });
  
    } catch (error) {
      console.error('Error handling ride start:', error);
    }
  });
  
  socket.on('end-ride', async (data) => {
    const { rideId } = data;
    const ride = await rideModel.findById(rideId)
      .populate('user captain');
    
    // Emit ride completion
    io.to(ride.captain.socketId).emit('ride-completed', ride);
  });
};

module.exports = { initializeSocket, sendMessageToSocketId };