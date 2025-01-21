import React, { useState, useEffect } from 'react';

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: -33.8688, lng: 151.2195 });
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        // Check if the script is already loaded
        if (window.google && window.google.maps) {
            initializeMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.gomaps.pro/maps/api/js?key=${import.meta.env.VITE_GOMAPPRO_API_KEY}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = () => initializeMap();
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);

    const initializeMap = () => {
        const mapElement = document.getElementById('map');
        if (mapElement && !map) {
            const newMap = new window.google.maps.Map(mapElement, {
                center: currentPosition,
                zoom: 15,
            });
            setMap(newMap);

            // Use standard Marker instead of AdvancedMarkerElement
            const newMarker = new window.google.maps.Marker({
                position: currentPosition,
                map: newMap,
                title: "You are here!",
            });
            setMarker(newMarker);
        }
    };

    useEffect(() => {
        if (map && marker) {
            map.setCenter(currentPosition);
            marker.setPosition(currentPosition);
        }
    }, [currentPosition]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });
        }
    }, []);

    return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
};

export default LiveTracking;