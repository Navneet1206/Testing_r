import { useEffect, useState } from "react";
import axios from "axios";

const RideManagement = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
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
    fetchRides();
  }, []);

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
              </div>

              {/* Card Footer */}
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
  );
};

export default RideManagement;