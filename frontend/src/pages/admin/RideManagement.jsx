import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [captains, setCaptains] = useState([]);
  // To hold the selected captain for each ride (keyed by ride id)
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    fetchRides();
    fetchCaptains();
  }, []);

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(res.data.rides);
    } catch (err) {
      console.error("Error fetching rides:", err);
    }
  };

  const fetchCaptains = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/captains`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptains(res.data.captains);
    } catch (err) {
      console.error("Error fetching captains:", err);
    }
  };

  const updateRideStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRides(rides.map(ride => (ride._id === id ? { ...ride, status } : ride)));
    } catch (err) {
      console.error("Error updating ride status:", err);
    }
  };

  // New function to assign a captain using the selected value
  const assignCaptain = async (rideId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const captainId = assignments[rideId];
      if (!captainId) {
        alert("Please select a captain.");
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides/${rideId}/assign`,
        { captainId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the ride in state with the assigned captain data
      setRides(rides.map(ride => ride._id === rideId ? res.data.ride : ride));
      // Clear selection for this ride
      setAssignments(prev => ({ ...prev, [rideId]: "" }));
    } catch (err) {
      console.error("Error assigning captain:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
        <Navbar/>
        <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ride Management</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => (
            <div key={ride._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                    {ride.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="text-gray-700">{ride.pickup}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-gray-700">{ride.destination}</p>
                </div>
                {/* If ride is not assigned, show dropdown to select a captain */}
                {!ride.captain && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Assign Captain</p>
                    <select
                      value={assignments[ride._id] || ""}
                      onChange={(e) =>
                        setAssignments(prev => ({ ...prev, [ride._id]: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded p-2"
                    >
                      <option value="">Select a captain</option>
                      {captains.map((captain) => (
                        <option key={captain._id} value={captain._id}>
                          {captain.fullname.firstname} {captain.fullname.lastname} ({captain.vehicle?.vehicleType})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignCaptain(ride._id)}
                      className="w-full mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer with Status Buttons */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateRideStatus(ride._id, "ongoing")}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={() => updateRideStatus(ride._id, "completed")}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateRideStatus(ride._id, "cancelled")}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default RideManagement;
