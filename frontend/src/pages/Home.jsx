
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import { FaLocationArrow } from 'react-icons/fa';

const Home = () => {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [panelOpen, setPanelOpen] = useState(false);
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null);
    const waitingForDriverRef = useRef(null);
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null);
    const [vehiclePanel, setVehiclePanel] = useState(false);
    const [confirmRidePanel, setConfirmRidePanel] = useState(false);
    const [vehicleFound, setVehicleFound] = useState(false);
    const [waitingForDriver, setWaitingForDriver] = useState(false);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const [fare, setFare] = useState({});
    const [vehicleType, setVehicleType] = useState(null);
    const [ride, setRide] = useState(null);
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [showRideDetailsPopup, setShowRideDetailsPopup] = useState(false); // State to control popup visibility

    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext);

    useEffect(() => {
        socket.emit('join', { userType: 'user', userId: user._id });
    }, [user]);

    useEffect(() => {
        const handleRideConfirmed = (ride) => {
            console.log('Ride confirmed:', ride); // Debugging log
            setVehicleFound(false);
            setWaitingForDriver(true);
            setRide(ride);
        };

        const handleRideStarted = (ride) => {
            console.log('Ride started:', ride); // Debugging log
            setWaitingForDriver(false);
            navigate('/riding', { state: { ride } });
        };

        socket.on('ride-confirmed', handleRideConfirmed);
        socket.on('ride-started', handleRideStarted);

        return () => {
            socket.off('ride-confirmed', handleRideConfirmed);
            socket.off('ride-started', handleRideStarted);
        };
    }, [socket, navigate]);

    const handlePickupChange = async (e) => {
        const inputValue = e.target.value;
        setPickup(inputValue);

        if (inputValue.length >= 3) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                    params: { input: inputValue },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setPickupSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
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
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                    params: { input: inputValue },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setDestinationSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setDestinationSuggestions([]);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();
    };

    useGSAP(() => {
        if (panelOpen && panelRef.current) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24,
            });
            gsap.to(panelCloseRef.current, {
                opacity: 1,
            });
        } else if (panelRef.current) {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0,
            });
            gsap.to(panelCloseRef.current, {
                opacity: 0,
            });
        }
    }, [panelOpen]);

    useGSAP(() => {
        if (vehiclePanel && vehiclePanelRef.current) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)',
            });
        } else if (vehiclePanelRef.current) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [vehiclePanel]);

    useGSAP(() => {
        if (confirmRidePanel && confirmRidePanelRef.current) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)',
            });
        } else if (confirmRidePanelRef.current) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [confirmRidePanel]);

    useGSAP(() => {
        if (vehicleFound && vehicleFoundRef.current) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)',
            });
        } else if (vehicleFoundRef.current) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [vehicleFound]);

    useGSAP(() => {
        if (waitingForDriver && waitingForDriverRef.current) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)',
            });
        } else if (waitingForDriverRef.current) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [waitingForDriver]);

    const findTrip = async () => {
        setVehiclePanel(true);
        setPanelOpen(false);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setFare(response.data);

            const sourceResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                params: { address: pickup },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const destinationResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                params: { address: destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSourceCoords(sourceResponse.data);
            setDestinationCoords(destinationResponse.data);
        } catch (error) {
            console.error('Error fetching fare or coordinates:', error);
        }
    };

    const createRide = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/create`,
                {
                    pickup,
                    destination,
                    vehicleType,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setRide(response.data);
            setShowRideDetailsPopup(true); // Show the popup after ride creation
            console.log('Ride created:', response.data); // Debugging log
        } catch (error) {
            console.error('Error creating ride:', error);
        }
    };

    return (
        <div className='h-screen relative overflow-hidden'>
            <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
            <div className='h-screen w-screen'>
                <LiveTracking sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
            </div>
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full'>
                <div className='h-[30%] p-6 bg-white relative'>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={submitHandler}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <div className="relative">
                            <input
                                onClick={() => {
                                    setPanelOpen(true);
                                    setActiveField('pickup');
                                }}
                                value={pickup}
                                onChange={handlePickupChange}
                                className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                                type="text"
                                placeholder='Add a pick-up location'
                            />
                            <button
                                onClick={async () => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(async (position) => {
                                            const { latitude, longitude } = position.coords;
                                            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                                                params: { address: `${latitude},${longitude}` },
                                                headers: {
                                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                                },
                                            });
                                            setPickup(response.data.formatted_address);
                                        });
                                    }
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
                            >
                                <FaLocationArrow className="text-xl" />
                            </button>
                        </div>
                        <input
                            onClick={() => {
                                setPanelOpen(true);
                                setActiveField('destination');
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3'
                            type="text"
                            placeholder='Enter your destination'
                        />
                    </form>
                    <button onClick={findTrip} className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full '>
                        Find Trip
                    </button>
                    <button onClick={() => setPanelOpen(false)} className='bg-red-600 text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Close
                    </button>
                </div>
                <div ref={panelRef} className='bg-white h-0'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>
            <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound}
                />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
               {ride && (
                   <div>
                       <p className='text-2xl font-semibold  text-red-600'>OTP : {ride.otp}</p>
                   </div>
               )}
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>

            {/* Ride Details Popup */}
            {showRideDetailsPopup && ride && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
                        <h2 className="text-2xl font-semibold mb-4">Ride Details</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Pickup Location</h3>
                                <p className="text-sm text-gray-600">{ride.pickup}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Destination</h3>
                                <p className="text-sm text-gray-600">{ride.destination}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Fare</h3>
                                <p className="text-sm text-gray-600">₹{ride.fare}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">Status</h3>
                                <p className="text-sm text-gray-600">{ride.status}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">OTP</h3>
                                <p className="text-sm text-gray-600">{ride.otp}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRideDetailsPopup(false)}
                            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;