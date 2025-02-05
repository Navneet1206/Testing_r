// frontend/src/components/RideStatus.jsx (new component)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RideStatus = ({ ride }) => {
    const [status, setStatus] = useState(ride.status);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/${ride._id}`);
            setStatus(res.data.status);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Ride Status</h3>
            <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full 
                    ${status === 'pending' ? 'bg-yellow-500' :
                      status === 'assigned' ? 'bg-blue-500' :
                      status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <p className="capitalize">{status}</p>
            </div>
            {status === 'pending' && (
                <p className="mt-2 text-gray-600">
                    Your request is under admin review. You'll receive an email once approved.
                </p>
            )}
        </div>
    );
};

export default RideStatus;