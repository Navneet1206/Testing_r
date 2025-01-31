import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LookingForDriver = (props) => {
    const [captainDistance, setCaptainDistance] = useState(null);
    const [captainTime, setCaptainTime] = useState(null);

    useEffect(() => {
        const fetchCaptainDistance = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
                    params: {
                        origin: props.captainLocation,  // Captain's live location
                        destination: props.pickup
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 200) {
                    setCaptainDistance(response.data.distance.text);
                    setCaptainTime(response.data.duration.text);
                }
            } catch (error) {
                console.error("Error fetching captain distance:", error);
            }
        };

        if (props.captainLocation) {
            fetchCaptainDistance();
        }
    }, [props.captainLocation, props.pickup]);

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setVehicleFound(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver...</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Vehicle" />
                <div className='w-full mt-5'>
                    {/* Pickup Location */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.pickup}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Pickup Location</p>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.destination}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Drop-off Location</p>
                        </div>
                    </div>

                    {/* Distance from Captain to User */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-road-map-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{captainDistance || "Finding driver..."}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Captain's Distance</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-time-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{captainTime || "Finding driver..."}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>ETA to Pickup</p>
                        </div>
                    </div>

                    {/* Fare */}
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.fare[props.vehicleType]} </h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Payment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LookingForDriver;
