import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CreditCard, Star } from 'lucide-react';
import axios from 'axios';

interface Ride {
  _id: string;
  pickup: {
    address: string;
  };
  dropoff: {
    address: string;
  };
  status: string;
  fare: number;
  distance: number;
  vehicleType: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  feedback?: {
    passengerRating?: number;
    driverRating?: number;
    passengerComment?: string;
    driverComment?: string;
  };
}

const RideHistory = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRides();
  }, [filter]);

  const fetchRides = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rides/history?filter=${filter}`);
      setRides(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ride history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ride History</h2>
            <p className="mt-1 text-sm text-gray-500">
              View all your past rides and their details
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Rides</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {rides.map((ride) => (
              <div key={ride._id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Route</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        From: {ride.pickup.address}
                      </p>
                      <p className="text-sm text-gray-900">
                        To: {ride.dropoff.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>Date & Time</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDate(ride.createdAt)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <CreditCard className="h-5 w-5 mr-2" />
                      <span>Payment Details</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      ₹{ride.fare.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {ride.paymentMethod} • {ride.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Star className="h-5 w-5 mr-2" />
                      <span>Rating</span>
                    </div>
                    {ride.feedback ? (
                      <div>
                        <div className="flex items-center mb-1">
                          {renderStars(ride.feedback.passengerRating)}
                        </div>
                        {ride.feedback.passengerComment && (
                          <p className="text-sm text-gray-600 italic">
                            "{ride.feedback.passengerComment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No rating provided</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ride.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : ride.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    {ride.distance.toFixed(1)} km
                  </span>
                </div>
              </div>
            ))}
            {rides.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No rides found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideHistory;