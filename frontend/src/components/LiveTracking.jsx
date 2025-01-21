import { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

// Map container style
const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center (can be overridden by user's current location)
const defaultCenter = {
    lat: -3.745, // Default latitude
    lng: -38.523 // Default longitude
};

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState(defaultCenter);

    // Effect to get the user's current location and update the position
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({
                        lat: latitude,
                        lng: longitude
                    });
                },
                (error) => {
                    console.error('Error getting current position:', error);
                }
            );

            // Watch for position changes (e.g., if the user moves)
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({
                        lat: latitude,
                        lng: longitude
                    });
                },
                (error) => {
                    console.error('Error watching position:', error);
                }
            );

            // Cleanup: Stop watching the position when the component unmounts
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        // Load the Google Maps API script
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOMAP_API_KEY}>
            {/* Render the Google Map */}
            <GoogleMap
                mapContainerStyle={containerStyle} // Set the map container size
                center={currentPosition} // Set the center of the map to the user's current position
                zoom={15} // Set the initial zoom level
            >
                {/* Render a marker at the user's current position */}
                <Marker position={currentPosition} />
            </GoogleMap>
        </LoadScript>
    );
};

export default LiveTracking;