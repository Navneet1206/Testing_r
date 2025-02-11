import { useEffect, useState } from "react";
import axios from "axios";

const RideManagement = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides`, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.post(`${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/rides/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setRides(rides.map(ride => (ride._id === id ? { ...ride, status } : ride)));
    } catch (err) {
      console.error("Error updating ride status:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ride Management</h1>
      <table className="w-full bg-white shadow-lg rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Pickup</th>
            <th className="p-3">Destination</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride._id} className="border-b">
              <td className="p-3">{ride.user.fullname.firstname} {ride.user.fullname.lastname}</td>
              <td className="p-3">{ride.pickup}</td>
              <td className="p-3">{ride.destination}</td>
              <td className="p-3 text-blue-500">{ride.status}</td>
              <td className="p-3 space-x-2">
                <button onClick={() => updateRideStatus(ride._id, "ongoing")} className="p-2 bg-blue-500 text-white rounded">Ongoing</button>
                <button onClick={() => updateRideStatus(ride._id, "completed")} className="p-2 bg-green-500 text-white rounded">Complete</button>
                <button onClick={() => updateRideStatus(ride._id, "cancelled")} className="p-2 bg-red-500 text-white rounded">Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RideManagement;
