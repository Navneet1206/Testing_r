import React from 'react';

const RidePopUp = ({ ride, setRidePopupPanel, setConfirmRidePopupPanel, confirmRide }) => {
    
    // If ride data is missing, show a loading message
    if (!ride) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-semibold">Loading Ride Details...</h3>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
            {/* Close Popup Button */}
            <h5 
                className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
                onClick={() => setRidePopupPanel(false)}
            >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            {/* Ride Details */}
            <h3 className="text-2xl font-semibold mb-5">New Ride Available!</h3>
            <div className="flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4">
                <div className="flex items-center gap-3">
                    <img 
                        className="h-12 w-12 rounded-full object-cover"
                        src={ride?.user?.profilePhoto || "https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"} 
                        alt="User"
                    />
                    <h2 className="text-lg font-medium">
                        {ride?.user?.fullname?.firstname} {ride?.user?.fullname?.lastname}
                    </h2>
                </div>
                <h5 className="text-lg font-semibold">2.2 KM</h5>
            </div>

            {/* Ride Information */}
            <div className="flex flex-col gap-2 justify-between items-center w-full mt-5">
                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="ri-map-pin-user-fill"></i>
                    <div>
                        <h3 className="text-lg font-medium">Pickup Location</h3>
                        <p className="text-sm -mt-1 text-gray-600">{ride?.pickup}</p>
                    </div>
                </div>

                <div className="flex items-center gap-5 p-3 border-b-2">
                    <i className="text-lg ri-map-pin-2-fill"></i>
                    <div>
                        <h3 className="text-lg font-medium">Drop-off Location</h3>
                        <p className="text-sm -mt-1 text-gray-600">{ride?.destination}</p>
                    </div>
                </div>

                <div className="flex items-center gap-5 p-3">
                    <i className="ri-currency-line"></i>
                    <div>
                        <h3 className="text-lg font-medium">₹{ride?.fare}</h3>
                        <p className="text-sm -mt-1 text-gray-600">Cash Payment</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 w-full">
                <button 
                    onClick={async () => {
                        setConfirmRidePopupPanel(true);
                        await confirmRide(); // Ensure the ride is confirmed before updating UI
                    }} 
                    className="bg-green-600 w-full text-white font-semibold p-2 px-10 rounded-lg"
                >
                    Accept
                </button>

                <button 
                    onClick={() => setRidePopupPanel(false)}
                    className="mt-2 w-full bg-gray-300 text-gray-700 font-semibold p-2 px-10 rounded-lg"
                >
                    Ignore
                </button>
            </div>
        </div>
    );
};

export default RidePopUp;
