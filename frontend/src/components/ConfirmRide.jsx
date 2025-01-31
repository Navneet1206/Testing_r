import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ConfirmRide = (props) => {
    const [distance, setDistance] = useState(null);
    const [time, setTime] = useState(null);

    useEffect(() => {
        const fetchDistance = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
                    params: {
                        origin: props.pickup,
                        destination: props.destination
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 200) {
                    setDistance(response.data.distance.text);
                    setTime(response.data.duration.text);
                }
            } catch (error) {
                console.error("Error fetching distance:", error);
            }
        };

        fetchDistance();
    }, [props.pickup, props.destination]);

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePanel(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm your Ride</h3>

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

                    {/* Distance & Estimated Time */}
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-road-map-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{distance || "Calculating..."}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Estimated Distance</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-time-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{time || "Calculating..."}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Estimated Time</p>
                        </div>
                    </div>

                    {/* Fare and Vehicle Type */}
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.fare[props.vehicleType]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.vehicleType}</p>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Payment</p>
                        </div>
                    </div>
                </div>

                {/* Confirm Ride Button */}
                <button onClick={() => {
                    props.setVehicleFound(true);
                    props.setConfirmRidePanel(false);
                    props.createRide();
                }} className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>
                    Confirm
                </button>
            </div>
        </div>
    );
}

export default ConfirmRide;
