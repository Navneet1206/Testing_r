import React from 'react';

const ConfirmRide = (props) => {
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
            <i className="text-lg ri-map-pin-2-fill"></i>
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
        </div>
        {/* Confirm Ride Button */}
        <button
          onClick={props.onConfirmRide}
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
