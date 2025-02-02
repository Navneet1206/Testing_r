const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle user/captain joining
    socket.on("join", async (data) => {
      console.log("🚀 Join event data received:", data);

      if (!data.userId || !data.userType) {
        console.log(
          "❌ Error: Invalid join request, missing userId or userType"
        );
        return socket.emit("error", { message: "Invalid userId or userType" });
      }

      try {
        if (data.userType === "captain") {
          const updatedCaptain = await captainModel.findByIdAndUpdate(
            data.userId,
            {
              socketId: socket.id,
              status: "active",
            },
            { new: true }
          );

          if (!updatedCaptain) {
            console.log("❌ Captain not found");
            return socket.emit("error", { message: "Captain not found" });
          }

          console.log(
            `✅ Captain ${updatedCaptain.fullname.firstname} is now active`
          );
        } else if (data.userType === "rider") {
          await userModel.findByIdAndUpdate(data.userId, {
            socketId: socket.id,
          });
        }
      } catch (error) {
        console.error("🔥 Error updating socket ID:", error);
        socket.emit("error", { message: "Failed to update socket ID" });
      }
    });

    socket.on('update-location-captain', async (data) => {
        console.log("🔄 Received location update:", data);
    
        if (!data || !data.captainId) {
            console.log("❌ Error: Captain ID is missing in location update");
            return socket.emit("error", { message: "Captain ID is required" });
        }
    
        if (!data.location || !data.location.ltd || !data.location.lng) {
            console.log("❌ Error: Invalid location data:", data);
            return socket.emit("error", { message: "Invalid location data" });
        }
    
        try {
            const updatedCaptain = await captainModel.findByIdAndUpdate(data.captainId, {
                location: {
                    type: 'Point',
                    coordinates: [data.location.lng, data.location.ltd]
                }
            }, { new: true });
    
            if (!updatedCaptain) {
                console.log("❌ Error: Captain not found in database");
                return socket.emit("error", { message: "Captain not found" });
            }
    
            console.log(`✅ Location updated for Captain ${updatedCaptain.fullname.firstname}:`, updatedCaptain.location);
        } catch (err) {
            console.error("🔥 Error updating captain location:", err);
            socket.emit("error", { message: "Failed to update location" });
        }
    });
    

    // Handle client disconnection
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      try {
        // Remove socketId from the captain or user document
        await captainModel.findOneAndUpdate(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
        await userModel.findOneAndUpdate(
          { socketId: socket.id },
          { $unset: { socketId: 1 } }
        );
      } catch (error) {
        console.error("Error cleaning up socket ID:", error);
      }
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };
