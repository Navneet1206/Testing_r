import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import { FaLocationArrow } from 'react-icons/fa';

const Home = () => {
  // Input and suggestion state
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // Other state variables
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const [ride, setRide] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Flow control states
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [rideConfirmed, setRideConfirmed] = useState(false);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  
  // Ref for bottom panel for auto scrolling
  const bottomPanelRef = useRef(null);

  useEffect(() => {
    socket.emit('join', { userType: 'user', userId: user._id });
  }, [user, socket]);

  // Listen for ride started event
  useEffect(() => {
    const handleRideStarted = (ride) => {
      console.log('Ride started:', ride);
      navigate('/riding', { state: { ride } });
    };

    socket.on('ride-started', handleRideStarted);
    return () => {
      socket.off('ride-started', handleRideStarted);
    };
  }, [socket, navigate]);

  // Auto scroll when any bottom panel becomes visible.
  useEffect(() => {
    if (vehiclePanel || confirmRidePanel || rideConfirmed) {
      bottomPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [vehiclePanel, confirmRidePanel, rideConfirmed]);

  const handlePickupChange = async (e) => {
    const inputValue = e.target.value;
    setPickup(inputValue);
    if (inputValue.length >= 3) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: inputValue },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setPickupSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching pickup suggestions:', error);
      }
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    const inputValue = e.target.value;
    setDestination(inputValue);
    if (inputValue.length >= 3) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: { input: inputValue },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setDestinationSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  // Called when "Find Trip" is clicked
  const findTrip = async () => {
    // Hide any suggestion dropdown
    setActiveField(null);
    // Show vehicle selection panel
    setVehiclePanel(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setFare(response.data);

      const sourceResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
        {
          params: { address: pickup },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const destinationResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
        {
          params: { address: destination },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSourceCoords(sourceResponse.data);
      setDestinationCoords(destinationResponse.data);
    } catch (error) {
      console.error('Error fetching fare or coordinates:', error);
    }
  };

  // Called when ride is confirmed in ConfirmRide
  const handleConfirmRide = async () => {
    if (confirmSubmitting) return;
    setConfirmSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        { pickup, destination, vehicleType },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setRide(response.data);
      console.log('Ride created:', response.data);
      // Hide panels; show congratulations message
      setConfirmRidePanel(false);
      setVehiclePanel(false);
      setRideConfirmed(true);
    } catch (error) {
      console.error('Error creating ride:', error);
    } finally {
      setConfirmSubmitting(false);
    }
  };

  // Reset flow for a new ride
  const resetFlow = () => {
    setPickup('');
    setDestination('');
    setPickupSuggestions([]);
    setDestinationSuggestions([]);
    setActiveField(null);
    setFare({});
    setVehicleType(null);
    setRide(null);
    setSourceCoords(null);
    setDestinationCoords(null);
    setVehiclePanel(false);
    setConfirmRidePanel(false);
    setRideConfirmed(false);
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* Section 1: Live Tracking (50vh) */}
      <div style={{ height: '50vh' }}>
        <LiveTracking sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
      </div>

      {/* Section 2: Input Form (30vh) */}
      <div style={{ height: '30vh' }} className="p-6 bg-white relative">
        <h4 className="text-2xl font-semibold mb-3">Find a trip</h4>
        <form className="relative pb-3" onSubmit={submitHandler}>
          {/* Pickup Input */}
          <div className="relative mb-3">
            <input
              onClick={() => setActiveField('pickup')}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full"
              type="text"
              placeholder="Add a pick-up location"
            />
            <button
              type="button"
              onClick={async () => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const response = await axios.get(
                      `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`,
                      {
                        params: { address: `${latitude},${longitude}` },
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                      }
                    );
                    setPickup(response.data.formatted_address);
                  });
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
            >
              <FaLocationArrow className="text-xl" />
            </button>
            {activeField === 'pickup' && pickupSuggestions.length > 0 && (
              <LocationSearchPanel
                suggestions={pickupSuggestions}
                onSelect={(suggestion) => {
                  setPickup(suggestion);
                  setActiveField(null);
                }}
              />
            )}
          </div>

          {/* Destination Input */}
          <div className="relative mb-3">
            <input
              onClick={() => setActiveField('destination')}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full"
              type="text"
              placeholder="Enter your destination"
            />
            {activeField === 'destination' && destinationSuggestions.length > 0 && (
              <LocationSearchPanel
                suggestions={destinationSuggestions}
                onSelect={(suggestion) => {
                  setDestination(suggestion);
                  setActiveField(null);
                }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={findTrip}
            className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Find Trip
          </button>
          {/* <button
            type="button"
            onClick={() => setActiveField(null)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg mt-3 w-full"
          >
            Close Suggestions
          </button> */}
        </form>
      </div>

      {/* Section 3: Bottom Panels (min 40vh) */}
      <div ref={bottomPanelRef} style={{ minHeight: '40vh' }} className="p-6">
        {vehiclePanel && (
          <div className="mb-3">
            <VehiclePanel
              selectVehicle={setVehicleType}
              fare={fare}
              setConfirmRidePanel={setConfirmRidePanel}
              setVehiclePanel={setVehiclePanel}
            />
          </div>
        )}
        {confirmRidePanel && (
          <div className="mb-3">
            <ConfirmRide
              onConfirmRide={handleConfirmRide}
              pickup={pickup}
              destination={destination}
              fare={fare}
              vehicleType={vehicleType}
              buttonDisabled={confirmSubmitting || rideConfirmed}
            />
          </div>
        )}
        {rideConfirmed && (
          <div className="bg-green-100 p-6 rounded-lg text-center z-50">
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="mb-4">Your ride has been confirmed.</p>
            <button onClick={resetFlow} className="bg-green-600 text-white px-4 py-2 rounded-lg">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
