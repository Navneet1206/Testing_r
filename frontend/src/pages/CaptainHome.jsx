import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";
import Captainnavbar from "../components/Captainnavbar";
import Livetracker from "../components/LiveTracker";

const CaptainHome = () => {
  const [rides, setRides] = useState([]);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [popup, setPopup] = useState({ show: false, type: '', ride: null, captainLocation: null });
  const { socket } = useContext(SocketContext);
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCaptainLocation({ lat: latitude, lng: longitude });
      });
    }
  }, []);

  const fetchRides = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found, redirecting to login");
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/rides/captain/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        const sortedRides = res.data.sort(
          (a, b) =>
            new Date(b.rideDate + " " + b.rideTime) -
            new Date(a.rideDate + " " + a.rideTime)
        );
        setRides(sortedRides);
      } else {
        setRides([]);
      }
    } catch (error) {
      setRides([]);
    }
  };

  useEffect(() => {
    fetchRides();
    if (!socket) return;
    socket.on("new-ride", (newRide) => {
      setRides((prevRides) => [newRide, ...prevRides]);
    });
    return () => {
      socket.off("new-ride");
    };
  }, [socket]);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Abhi ka hai 🚀";
    if (diffDays === 1) return "1 din Baad";
    if (diffDays < 30) return `${diffDays} din Baad`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mahine Baad`;
    return `${Math.floor(diffDays / 365)} saal Baad`;
  };

  const computeDistance = (lat1, lng1, lat2, lng2) => {
    if (window.google?.maps?.geometry) {
      const p1 = new window.google.maps.LatLng(lat1, lng1);
      const p2 = new window.google.maps.LatLng(lat2, lng2);
      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      return (distanceInMeters / 1000).toFixed(2);
    }
    return null;
  };

  const openPopup = (type, ride) => {
    setPopup({ show: true, type, ride, captainLocation });
  };

  const MapModal = ({ type, ride, captainLocation, onClose }) => {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);

    const geocodeAddress = (address, callback) => {
      if (!window.google?.maps) {
        callback(null);
        return;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          callback({ lat: location.lat(), lng: location.lng() });
        } else {
          callback(null);
        }
      });
    };

    useEffect(() => {
      if (type === "from") {
        // Route: Your location → Pickup
        setSource(captainLocation);
        if (ride.pickupCoords) {
          setDestination(ride.pickupCoords);
        } else {
          geocodeAddress(ride.pickup, setDestination);
        }
      } else if (type === "path") {
        // Route: Pickup → Destination
        if (ride.pickupCoords) {
          setSource(ride.pickupCoords);
        } else {
          geocodeAddress(ride.pickup, setSource);
        }
        if (ride.destinationCoords) {
          setDestination(ride.destinationCoords);
        } else {
          geocodeAddress(ride.destination, setDestination);
        }
      }
    }, [type, ride, captainLocation]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2">
        <div className="bg-white rounded-lg w-full max-w-lg relative shadow-lg">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 p-2"
          >
            ×
          </button>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">
              {type === "from" ? "Route: You → Pickup" : "Route: Pickup → Destination"}
            </h2>
            {(!source || !destination) ? (
              <p className="text-center py-4">Loading map...</p>
            ) : (
              // Adding a key based on type and coordinates forces remount so that the map reinitializes.
              <div className="h-64 w-full">
                <Livetracker 
                  key={`live-${type}-${source.lat}-${destination.lat}`} 
                  sourceCoords={source} 
                  destinationCoords={destination} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDistanceInfo = (ride) => {
    if (captainLocation && ride.pickupCoords && ride.destinationCoords) {
      const distanceToPickup = computeDistance(
        captainLocation.lat,
        captainLocation.lng,
        ride.pickupCoords.ltd,
        ride.pickupCoords.lng
      );
      const distancePickupToDest = computeDistance(
        ride.pickupCoords.ltd,
        ride.pickupCoords.lng,
        ride.destinationCoords.ltd,
        ride.destinationCoords.lng
      );
      return (
        <div className="text-xs space-y-1 mt-2">
          <p className="text-gray-500">You → Pickup: {distanceToPickup} km</p>
          <p className="text-gray-500">Pickup → Dest: {distancePickupToDest} km</p>
        </div>
      );
    }
    return null;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-500",
      accepted: "bg-orange-500",
      ongoing: "bg-blue-500",
      completed: "bg-green-500",
      canceled: "bg-red-500",
      cancelled: "bg-red-500",
    };
    return (
      <span className={`${statusStyles[status] || 'bg-gray-500'} text-white px-2 py-1 rounded-full text-xs font-medium`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Captainnavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-2 sm:p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🚖 Rides</h1>
            <button 
              onClick={fetchRides} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm flex items-center gap-1"
            >
              🔄 Refresh
            </button>
          </div>

          {rides.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">No rides available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div key={ride._id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">📍</span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">From</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{ride.pickup}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 mt-1">🎯</span>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">To</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{ride.destination}</p>
                        </div>
                      </div>
                      {renderDistanceInfo(ride)}
                    </div>
                    <div className="flex flex-row sm:flex-col justify-between items-end gap-2">
                      <p className="text-lg sm:text-xl font-bold text-gray-800">₹{ride.fare}</p>
                      {getStatusBadge(ride.status)}
                    </div>
                  </div>

                  <div className="border-t mt-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Schedule</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(ride.rideDate).toLocaleDateString()} • {ride.rideTime}
                        </p>
                        <p className="text-xs text-gray-500">{getTimeAgo(ride.rideDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          📧 {ride.adminEmail || "rajvl132011@gmail.com"}
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          📱 {ride.adminPhone || "+91 8435061006"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openPopup("from", ride)}
                      className="flex-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-medium"
                    >
                      From You
                    </button>
                    <button
                      onClick={() => openPopup("path", ride)}
                      className="flex-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded text-xs font-medium"
                    >
                      Path
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {popup.show && (
        <MapModal
          type={popup.type}
          ride={popup.ride}
          captainLocation={popup.captainLocation}
          onClose={() => setPopup({ show: false, type: '', ride: null, captainLocation: null })}
        />
      )}
    </>
  );
};

export default CaptainHome;
