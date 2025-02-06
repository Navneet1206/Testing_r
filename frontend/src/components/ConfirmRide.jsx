import React, { useState } from 'react';
import axios from 'axios';

const ConfirmRide = (props) => {
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');

  // Use the environment variable provided by Vite
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  const handleConfirmRide = async () => {
    if (!rideDate || !rideTime) {
      alert('Please select a date and time for your ride.');
      return;
    }

    const rideData = {
      pickup: props.pickup,
      destination: props.destination,
      vehicleType: props.vehicleType,
      fare: props.fare[props.vehicleType],
      rideDate,  // Date selected by the user
      rideTime   // Time selected by the user
    };

    try {
      const response = await axios.post(`${baseUrl}/rides/create`, rideData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Ride confirmed! Check your email for details.');
      props.onRideConfirmed(response.data);
    } catch (error) {
      console.error('Error confirming ride:', error);
      alert('Failed to confirm ride. Please try again.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-2xl font-semibold mb-5 text-center">Confirm your Ride</h3>
      <div className="flex flex-col items-center gap-4">
        <img
          className="h-20"
          src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
          alt="Vehicle"
        />
        <div className="w-full">
          {/* Pickup Location */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className="text-lg font-medium">{props.pickup}</h3>
              <p className="text-sm text-gray-600">Pickup Location</p>
            </div>
          </div>
          {/* Destination */}
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-2-fill"></i>
            <div>
              <h3 className="text-lg font-medium">{props.destination}</h3>
              <p className="text-sm text-gray-600">Drop-off Location</p>
            </div>
          </div>
          {/* Fare and Vehicle Type */}
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            <div>
              <h3 className="text-lg font-medium">₹{props.fare[props.vehicleType]}</h3>
              <p className="text-sm text-gray-600">{props.vehicleType}</p>
              <p className="text-sm text-gray-600">Cash Payment</p>
            </div>
          </div>
          {/* Date and Time Input */}
          <div className="flex flex-col p-3">
            <label className="text-gray-600 text-sm">Select Ride Date:</label>
            <input
              className="border p-2 rounded w-full"
              type="date"
              value={rideDate}
              onChange={(e) => setRideDate(e.target.value)}
              required
            />
            <label className="text-gray-600 text-sm mt-2">Select Ride Time:</label>
            <input
              className="border p-2 rounded w-full"
              type="time"
              value={rideTime}
              onChange={(e) => setRideTime(e.target.value)}
              required
            />
          </div>
        </div>
        {/* Confirm Ride Button */}
        <button
          onClick={handleConfirmRide}
          disabled={props.buttonDisabled}
          className={`w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg ${
            props.buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;
