import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WaitingForDriver = (props) => {
    const [ride, setRide] = useState(props.ride); // Local state for ride data

    // Function to fetch ride data
    const fetchRideData = async () => {
        if (!props.ride || !props.ride._id) {
            console.error('Ride data is not available.');
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/${props.ride._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setRide(response.data); // Update ride data
        } catch (error) {
            console.error('Error fetching ride data:', error);
        }
    };

    // Auto-reload ride data every second
    useEffect(() => {
        if (!props.ride || !props.ride._id) {
            console.error('Ride data is not available.');
            return;
        }

        const interval = setInterval(() => {
            fetchRideData();
        }, 1000); // Fetch data every 1 second

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [props.ride]); // Add props.ride as a dependency

    // If ride data is not available, show a loading message
    if (!ride || !ride.captain) {
        return <div>Loading ride details...</div>;
    }

    // Extract essential data
    const essentialData = {
        pickup: ride.pickup,
        destination: ride.destination,
        fare: ride.fare,
        status: ride.status,
        otp: ride.otp,
        captain: {
            name: ride.captain.fullname.firstname + ' ' + ride.captain.fullname.lastname,
            vehiclePlate: ride.captain.vehicle.plate,
        },
        user: {
            name: ride.user.fullname.firstname + ' ' + ride.user.fullname.lastname,
            email: ride.user.email,
        },
    };

    return (
        <div className="overflow-scroll">

            {/* Driver and Vehicle Details */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                <img
                    className="h-12 rounded-lg"
                    src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                    alt="Vehicle"
                />
            </div>

            {/* Ride Details */}
            <div className="flex gap-2 justify-between flex-col items-center mt-6">
                <div className="w-full">
                    <div className="flex items-center gap-5 p-3 border-b-2">
                        <i className="ri-map-pin-user-fill text-xl text-purple-600"></i>
                        <div>
                            <h3 className="text-lg font-medium">Pickup Location </h3>
                            <p className="text-sm -mt-1 text-gray-600">{essentialData.pickup}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 p-3 border-b-2">
                        <i className="ri-map-pin-2-fill text-xl text-purple-600"></i>
                        <div>
                            <h3 className="text-lg font-medium">Destination</h3>
                            <p className="text-sm -mt-1 text-gray-600">{essentialData.destination}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 p-3">
                        <i className="ri-currency-line text-xl text-purple-600"></i>
                        <div>
                            <h3 className="text-lg font-medium">₹{essentialData.fare}</h3>
                            <p className="text-sm -mt-1 text-gray-600">Cash Payment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingForDriver;