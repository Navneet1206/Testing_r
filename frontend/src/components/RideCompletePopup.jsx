import React from 'react';

const RideCompletePopup = ({ onConfirm, rideDetails }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        <p className="mb-4">Ride completed successfully!</p>
        <div className="mb-4">
          <p>Distance: {rideDetails.distance} km</p>
          <p>Fare: ₹{rideDetails.fare}</p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  );
};
export default RideCompletePopup;