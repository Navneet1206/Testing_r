import React, { useState } from 'react';
import axios from 'axios';

const ConfirmRide = (props) => {
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Use the environment variable provided by Vite
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  const handleConfirmRide = async () => {
    if (!rideDate || !rideTime) {
      setShowValidationModal(true);
      return;
    }

    setIsSubmitting(true);
    const rideData = {
      pickup: props.pickup,
      destination: props.destination,
      vehicleType: props.vehicleType,
      fare: props.fare[props.vehicleType],
      rideDate,
      rideTime
    };

    try {
      const response = await axios.post(`${baseUrl}/rides/create`, rideData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowSuccess(true);
      // Call the parent's onRideConfirmed handler with the response data
      props.onRideConfirmed && props.onRideConfirmed(response.data);
      
      // Reset all panels and show only success message (after a brief delay)
      setTimeout(() => {
        props.resetFlow && props.resetFlow();
      }, 2000);
    } catch (error) {
      console.error('Error confirming ride:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Message Component
  if (showSuccess) {
    return (
      <div className="bg-green-100 p-6 rounded-lg text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          Congratulations! 🎉
        </h2>
        <p className="text-green-700">
          Your ride has been successfully confirmed. You will receive the details shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow relative">
      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-xl font-semibold mb-2">Date and Time Required</h3>
            <p className="text-gray-600 mb-4">
              Please select both a date and time for your ride before confirming.
            </p>
            <button
              onClick={() => setShowValidationModal(false)}
              className="w-full bg-blue-600 text-white font-semibold p-2 rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h3 className="text-2xl font-semibold mb-5 text-center">Confirm your Ride</h3>
      <div className="flex flex-col items-center gap-4">
        <img
          className="h-20"
          src="/api/placeholder/400/320"
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
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="date"
              value={rideDate}
              onChange={(e) => setRideDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <label className="text-gray-600 text-sm mt-2">Select Ride Time:</label>
            <input
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          disabled={isSubmitting || props.buttonDisabled}
          className={`w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg flex items-center justify-center ${
            (isSubmitting || props.buttonDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming...
            </div>
          ) : (
            'Confirm Ride'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmRide;