import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const SocketProvider = ({ children }) => {
    const [captainId, setCaptainId] = useState(null);

    useEffect(() => {
        // Fetch captainId from local storage or API
        const storedCaptainId = localStorage.getItem("captainId");
        if (storedCaptainId) {
            setCaptainId(storedCaptainId);
        }

        socket.on('connect', () => {
            console.log('✅ Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // 🛠️ Update location every 5 seconds
    useEffect(() => {
        const updateLocation = () => {
            if (!captainId) {
                console.warn("⚠ Captain ID is missing. Not sending location update.");
                return;
            }

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const locationData = {
                        captainId,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude,
                        }
                    };

                    console.log("📡 Sending location update:", locationData);
                    socket.emit("update-location-captain", locationData);
                }, (error) => {
                    console.error("⚠ Geolocation error:", error);
                });
            } else {
                console.error("⚠ Geolocation not supported.");
            }
        };

        const locationInterval = setInterval(updateLocation, 5000); // Update every 5 seconds

        return () => clearInterval(locationInterval);
    }, [captainId]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
