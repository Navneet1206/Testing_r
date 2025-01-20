import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Car, FileCheck, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  documents: {
    aadhar?: {
      front: string;
      back: string;
    };
    license?: {
      front: string;
      back: string;
    };
    vehicle?: {
      type: string;
      registrationNumber: string;
      insurance: string;
    };
  };
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDrivers();
  }, [user, navigate]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/drivers');
      setDrivers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/drivers/${driverId}/approve`);
      fetchDrivers();
      setIsReviewModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve driver');
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/drivers/${driverId}/reject`);
      fetchDrivers();
      setIsReviewModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject driver');
    }
  };

  const openReviewModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsReviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage drivers and review their documents
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">{drivers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved Drivers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drivers.filter(d => d.isApproved).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileCheck className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {drivers.filter(d => !d.isApproved).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Driver Applications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {drivers.map((driver) => (
              <div key={driver._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={driver.documents?.aadhar?.front || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        alt={driver.name}
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{driver.name}</h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{driver.email}</span>
                        <span>•</span>
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {driver.isApproved ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => openReviewModal(driver)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Review Documents
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {drivers.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No driver applications found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Review Modal */}
      {isReviewModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Review Driver Documents</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Driver Info */}
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full"
                  src={selectedDriver.documents?.aadhar?.front || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt={selectedDriver.name}
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedDriver.name}</h4>
                  <p className="text-sm text-gray-500">{selectedDriver.email}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-6">
                {/* Aadhar Card */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Aadhar Card</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDriver.documents?.aadhar?.front && (
                      <img
                        src={selectedDriver.documents.aadhar.front}
                        alt="Aadhar Front"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    {selectedDriver.documents?.aadhar?.back && (
                      <img
                        src={selectedDriver.documents.aadhar.back}
                        alt="Aadhar Back"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Driving License */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Driving License</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDriver.documents?.license?.front && (
                      <img
                        src={selectedDriver.documents.license.front}
                        alt="License Front"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    {selectedDriver.documents?.license?.back && (
                      <img
                        src={selectedDriver.documents.license.back}
                        alt="License Back"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Vehicle Details */}
                {selectedDriver.documents?.vehicle && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Vehicle Details</h5>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Vehicle Type</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {selectedDriver.documents.vehicle.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Registration Number</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedDriver.documents.vehicle.registrationNumber}
                          </p>
                        </div>
                      </div>
                      {selectedDriver.documents.vehicle.insurance && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Insurance Document</p>
                          <img
                            src={selectedDriver.documents.vehicle.insurance}
                            alt="Insurance"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRejectDriver(selectedDriver._id)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircle className="h-4 w-4 inline-block mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleApproveDriver(selectedDriver._id)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-4 w-4 inline-block mr-1" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;