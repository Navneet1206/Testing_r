import React, { useState, useEffect } from 'react';

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: -33.8688, lng: 151.2195 });

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${import.meta.env.VITE_GOMAPPRO_API_KEY}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Initialize the map
            const map = new window.google.maps.Map(document.getElementById('map'), {
                center: currentPosition,
                zoom: 15,
            });

            // Add a marker for the current position
            new window.google.maps.Marker({
                position: currentPosition,
                map: map,
                title: "You are here!",
            });
        };
        document.body.appendChild(script);

        // Get the current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });
        }

        return () => {
            document.body.removeChild(script);
        };
    }, [currentPosition]);

    return (
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
    );
};

export default LiveTracking;