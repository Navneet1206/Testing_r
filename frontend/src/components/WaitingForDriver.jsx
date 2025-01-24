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
    if (!props.ride) {
        return <div>Loading ride details...</div>;
    }

    return (
        <div>
            {/* Close Button */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 text-red-700' onClick={() => {
                props.waitingForDriver(false);
            }}>
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            {/* Driver and Vehicle Details */}
            <div className='flex items-center justify-between'>
                <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='text-right'>
                    <h1 className="text-lg font-semibold text-red-900">OTP: {ride?.otp}</h1>
                    alert('OTP: ', ride?.otp);
                    <h2 className='text-lg font-medium capitalize text-red-900'>{ride?.captain.fullname.firstname}</h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1 text-red-900'>{ride?.captain.vehicle.plate}</h4>
                    <p className='text-sm text-gray-600 text-red-900'>Maruti Suzuki Alto</p>
                </div>
            </div>

            {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{ride?.fare} </h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingForDriver;