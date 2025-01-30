import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import { SocketContext } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CapatainContext';
import axios from 'axios';
import LiveTracking from '../components/LiveTracking';

const CaptainHome = () => {
    const [ridePopupPanel, setRidePopupPanel] = useState(false);
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
    const ridePopupPanelRef = useRef(null);
    const confirmRidePopupPanelRef = useRef(null);
    const [ride, setRide] = useState(null);

    const { socket } = useContext(SocketContext);
    const { captain, isLoading, error } = useContext(CaptainDataContext);

    useEffect(() => {
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain',
        });

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            ltd: latitude,
                            lng: longitude,
                        },
                    });
                });
            }
        };

        const locationInterval = setInterval(updateLocation, 10000);
        updateLocation();

        return () => clearInterval(locationInterval);
    }, []);

    useEffect(() => {
        socket.on('new-ride', (data) => {
            setRide(data);
            setRidePopupPanel(true);
        });

        return () => {
            socket.off('new-ride');
        };
    }, []);

    const confirmRide = async () => {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
            rideId: ride._id,
            captainId: captain._id,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        setRidePopupPanel(false);
        setConfirmRidePopupPanel(true);
    };

    useGSAP(() => {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)',
            });
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [ridePopupPanel]);

    useGSAP(() => {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)',
            });
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)',
            });
        }
    }, [confirmRidePopupPanel]);
    if (isLoading) {
        return <div>Loading captain data...</div>;
      }
    
      if (error) {
        return <div>Error: {error}</div>;
      }
    
      if (!captain) {
        return <div>No captain data found. Please log in again.</div>;
      }
    return (
        <div className='h-screen flex flex-col overflow-hidden'> 
            <div className='fixed p-4 top-0 flex items-center justify-between w-full bg-white shadow-md z-50'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
                <div className=' flex items-center justify-center  rounded-full'>
                 </div>
                <Link to='/captain/logout' className='h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='flex-1 flex flex-col mt-4 overflow-y-scroll'>
                <div className='flex-1 h-1/5 p-0'>
                    <LiveTracking 
                        sourceCoords={captain.location}
                        destinationCoords={captain.location}
                    />
                </div>
                <div className='h-1/5 pr-6 pl-6 overflow-y-scroll bg-white'>
                    <CaptainDetails />
                </div>
            </div>
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 transform translate-y-full bg-white px-3 py-10 pt-12 shadow-lg'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 transform translate-y-full bg-white px-3 py-10 pt-12 shadow-lg'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel}
                />
            </div>
        </div>
    );
};

export default CaptainHome;