import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapComponentProps {
  onLocationSelect?: (location: { address: string; coordinates: [number, number] }) => void;
  initialCenter?: { lat: number; lng: number };
  markers?: Array<{ position: { lat: number; lng: number }; title: string }>;
  showCurrentLocation?: boolean;
}

declare global {
  interface Window {
    google: any;
    map: any;
  }
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialCenter = { lat: 20.5937, lng: 78.9629 }, // Center of India
  markers = [],
  showCurrentLocation = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchBox, setSearchBox] = useState<any>(null);

  useEffect(() => {
    const loadMap = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${process.env.GOMAP_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.body.appendChild(script);
      } else {
        initializeMap();
      }
    };

    loadMap();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Initialize search box
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const searchBoxInstance = new window.google.maps.places.SearchBox(input);
    setSearchBox(searchBoxInstance);

    mapInstance.addListener('bounds_changed', () => {
      searchBoxInstance.setBounds(mapInstance.getBounds());
    });

    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(17);

      if (onLocationSelect) {
        onLocationSelect({
          address: place.formatted_address,
          coordinates: [
            place.geometry.location.lat(),
            place.geometry.location.lng()
          ]
        });
      }
    });

    // Add markers
    markers.forEach(marker => {
      new window.google.maps.Marker({
        position: marker.position,
        map: mapInstance,
        title: marker.title
      });
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (map) {
          map.setCenter(pos);
          map.setZoom(17);

          new window.google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4F46E5',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Reverse geocode the coordinates
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results: any, status: string) => {
            if (status === 'OK' && results[0] && onLocationSelect) {
              onLocationSelect({
                address: results[0].formatted_address,
                coordinates: [pos.lat, pos.lng]
              });
            }
          });
        }
      },
      () => {
        alert('Error: The Geolocation service failed.');
      }
    );
  };

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 z-10">
        <input
          id="pac-input"
          type="text"
          placeholder="Search for a location"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {showCurrentLocation && (
        <button
          onClick={handleCurrentLocation}
          className="absolute top-16 right-4 z-10 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <MapPin className="h-4 w-4 inline-block mr-2" />
          Use Current Location
        </button>
      )}
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg shadow-md"
      />
    </div>
  );
};

export default MapComponent;