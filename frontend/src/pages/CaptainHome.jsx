import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";

const CaptainHome = () => {
  const [rides, setRides] = useState([]);
  const { socket } = useContext(SocketContext);

  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  const fetchRides = async () => {
    const token = localStorage.getItem("token"); 
    console.log("🔑 Token before API call:", token); 

    if (!token) {
        console.error("❌ No token found, redirecting to login");
        return; 
    }

    try {
        const res = await axios.get(`${baseUrl}/rides/captain/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
            console.log("✅ Total Rides Fetched:", res.data.length);

            // ✅ Extra sorting to ensure latest rides are on top
            const sortedRides = res.data.sort((a, b) => new Date(b.rideDate + " " + b.rideTime) - new Date(a.rideDate + " " + a.rideTime));

            setRides(sortedRides);
        } else {
            console.error("❌ Unexpected API Response:", res.data);
            setRides([]);
        }
    } catch (error) {
        console.error("❌ Error Fetching Rides:", error.response?.data?.message || error.message);
        setRides([]);
    }
};




  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return "Abhi ka hai 🚀";
    if (diffDays === 1) return "1 din Baad";
    if (diffDays < 30) return `${diffDays} din Baad`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mahine Baad`;
    return `${Math.floor(diffDays / 365)} saal Baad`;
  };

  useEffect(() => {
    fetchRides(); // ✅ Fetch rides on mount

    if (!socket) return;

    socket.on("new-ride", (newRide) => {
        console.log("🚀 New Ride Received:", newRide);
        setRides((prevRides) => [newRide, ...prevRides]); // ✅ Add new ride to top
    });

    return () => {
        socket.off("new-ride");
    };
}, [socket]);


  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-500",
      assigned: "bg-orange-500",
      ongoing: "bg-blue-500",
      completed: "bg-green-500",
      canceled: "bg-red-500",
    };

    return (
      <span className={`${statusStyles[status] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-sm font-medium`}>
        {status}
      </span>
    );
  };

  return (
    <>
    <Captainnavbar />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🚖 Available Rides</h1>
          <button 
            onClick={fetchRides} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>

        {rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No rides available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rides.map((ride) => (
              <div 
                key={ride.rideId} 
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📍</span>
                      <div>
                        <p className="text-sm text-gray-500">Pickup</p>
                        <p className="font-medium text-gray-800">{ride.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">🎯</span>
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="font-medium text-gray-800">{ride.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">₹{ride.fare}</p>
                    {getStatusBadge(ride.status)}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-800">
                        {new Date(ride.rideDate).toLocaleDateString()} - {ride.rideTime}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{getTimeAgo(ride.rideDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Details</p>
                      <p className="font-medium text-gray-800">
                        📧 {ride.adminEmail || "rajvl132011@gmail.com"}
                      </p>
                      <p className="font-medium text-gray-800">
                        📱 {ride.adminPhone || "+91 8435061006"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CaptainHome;