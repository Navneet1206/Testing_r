// Frontend/src/pages/UserRideHistory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

const UserRideHistory = () => {
    const [rides, setRides] = useState([]);
    const { user } = useContext(UserDataContext);

    useEffect(() => {
        const fetchRideHistory = async () => {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/user/history`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setRides(response.data);
        };
        fetchRideHistory();
    }, []);

    return (
        <div>
            <h2>Your Ride History</h2>
            {rides.map((ride) => (
                <div key={ride._id}>
                    <p>Pickup: {ride.pickup}</p>
                    <p>Destination: {ride.destination}</p>
                    <p>Fare: ₹{ride.fare}</p>
                </div>
            ))}
        </div>
    );
};

export default UserRideHistory;