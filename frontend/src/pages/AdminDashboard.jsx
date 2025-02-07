import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [rides, setRides] = useState([]);
  const [captains, setCaptains] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  // Fetch all rides
  const fetchRides = async () => {
    try {
      const res = await axios.get(`${baseUrl}/admin/rides`);
      setRides(res.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  // Fetch all captains
  const fetchCaptains = async () => {
    try {
      const res = await axios.get(`${baseUrl}/captains`);
      setCaptains(res.data);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchCaptains();
  }, []);

  const assignRide = async (rideId, captainId) => {
    try {
      await axios.post(`${baseUrl}/admin/rides/${rideId}/assign`, { captainId });
      alert("Ride assigned successfully!");
      fetchRides();
    } catch (error) {
      console.error("Error assigning ride:", error);
    }
  };

  const endRide = async (rideId) => {
    try {
      await axios.post(`${baseUrl}/admin/rides/${rideId}/end`);
      alert("Ride ended successfully!");
      fetchRides();
    } catch (error) {
      console.error("Error ending ride:", error);
    }
  };

  const cancelRide = async (rideId) => {
    try {
      await axios.post(`${baseUrl}/admin/rides/${rideId}/cancel`);
      alert("Ride cancelled successfully!");
      fetchRides();
    } catch (error) {
      console.error("Error cancelling ride:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-2xl font-bold text-center mb-5">🛠️ Admin Dashboard</h1>

      <div className="max-w-4xl mx-auto">
        {rides.length === 0 ? (
          <p className="text-center text-gray-500">No rides available.</p>
        ) : (
          <ul>
            {rides.map((ride) => (
              <li key={ride._id} className="border p-4 mt-2 bg-white shadow rounded-xl">
                <p><b>Pickup:</b> {ride.pickup}</p>
                <p><b>Destination:</b> {ride.destination}</p>
                <p><b>Status:</b> {ride.status}</p>
                <p><b>Assigned Captain:</b> {ride.captain?.name || "Not Assigned"}</p>

                {ride.status === "pending" && (
                  <div>
                    <label><b>Assign Captain:</b></label>
                    <select 
                      onChange={(e) => assignRide(ride._id, e.target.value)}
                      className="border p-2 rounded-md">
                      <option value="">Select Captain</option>
                      {captains.map((captain) => (
                        <option key={captain._id} value={captain._id}>{captain.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {ride.status === "assigned" && (
                  <button 
                    onClick={() => endRide(ride._id)} 
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded-md">
                    ✅ End Ride
                  </button>
                )}

                {ride.status !== "completed" && (
                  <button 
                    onClick={() => cancelRide(ride._id)} 
                    className="bg-red-500 text-white px-4 py-2 mt-2 rounded-md">
                    ❌ Cancel Ride
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
