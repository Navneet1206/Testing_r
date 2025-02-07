import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";

const CaptainHome = () => {
    const [rides, setRides] = useState([]); // ✅ Always initialize as an array
  const { socket } = useContext(SocketContext); // ✅ Use socket from context

  const fetchRides = async () => {
    try {
      const res = await axios.get("/rides/captain/all");
  
      if (Array.isArray(res.data)) {
        setRides(res.data); // ✅ Set only if data is an array
      } else {
        console.error("Unexpected response format:", res.data);
        setRides([]); // ✅ Fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching rides", error);
      setRides([]); // ✅ Prevents crashes by setting empty array
    }
  };
  

  useEffect(() => {
    fetchRides();

    if (!socket) return; // ✅ Prevents 'socket.on is not a function' error

    // ✅ Listen for new ride updates
    socket.on("new-ride", (newRide) => {
      setRides((prevRides) => [newRide, ...prevRides]); // Add new ride at top
    });

    return () => {
      socket.off("new-ride"); // Cleanup on unmount
    };
  }, [socket]); // ✅ Run only when `socket` is ready

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-2xl font-bold text-center mb-5">🚖 Available Rides</h1>

      {/* Refresh Button */}
      <div className="flex justify-center mb-4">
        <button 
          onClick={fetchRides} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🔄 Refresh Rides
        </button>
      </div>

      {/* Ride List */}
      <div className="max-w-4xl mx-auto">
        {rides.length === 0 ? (
          <p className="text-center text-gray-500">No rides available.</p>
        ) : (
            <ul>
            {Array.isArray(rides) && rides.length > 0 ? (
              rides.map((ride) => (
                <li key={ride.rideId} className="border p-4 mt-2">
                  <p><b>Pickup:</b> {ride.pickup}</p>
                  <p><b>Destination:</b> {ride.destination}</p>
                  <p><b>Fare:</b> ₹{ride.fare}</p>
                  <p><b>Date:</b> {ride.rideDate} - {ride.rideTime}</p>
                  <p><b>Status:</b> <span className={`badge ${ride.status}`}>{ride.status}</span></p>
                  <p><b>Admin Email:</b> {ride.adminEmail}</p>
                  <p><b>Admin Phone:</b> {ride.adminPhone}</p>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No rides available.</p>
            )}
          </ul>
          
        )}
      </div>
    </div>
  );
};

// Function to return status color
const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-yellow-500 text-white";
    case "assigned": return "bg-orange-500 text-white";
    case "ongoing": return "bg-blue-500 text-white";
    case "completed": return "bg-green-500 text-white";
    case "canceled": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

export default CaptainHome;
