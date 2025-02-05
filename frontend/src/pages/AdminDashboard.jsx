// frontend/src/pages/AdminDashboard.jsx (new file)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [rides, setRides] = useState([]);
    const [captains, setCaptains] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const ridesRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/rides/pending`);
            const captainsRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains`);
            setRides(ridesRes.data);
            setCaptains(captainsRes.data);
        };
        fetchData();
    }, []);

    const handleAssign = async (captainId) => {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/rides/${selectedRide}/assign`, {
            captainId
        });
        setSelectedRide(null);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Pending Ride Requests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rides.map(ride => (
                    <div key={ride._id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{ride.user.fullname.firstname}'s Ride</h3>
                                <p>{ride.pickup} → {ride.destination}</p>
                                <p className="text-gray-600">₹{ride.fare}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSelectedRide(ride._id)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRide && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Assign Captain</h3>
                        <select 
                            className="w-full p-2 border rounded mb-4"
                            onChange={(e) => handleAssign(e.target.value)}
                        >
                            <option value="">Select Captain</option>
                            {captains.map(captain => (
                                <option key={captain._id} value={captain._id}>
                                    {captain.fullname.firstname} - {captain.vehicle.plate}
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={() => setSelectedRide(null)}
                            className="w-full bg-gray-500 text-white p-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;