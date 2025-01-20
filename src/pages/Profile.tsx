import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Camera, Upload, Shield, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
  role: string;
  documents?: {
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
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: ''
  });
  const [documents, setDocuments] = useState<{
    aadharFront?: File;
    aadharBack?: File;
    licenseFront?: File;
    licenseBack?: File;
    insurance?: File;
  }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone || '',
        vehicleType: response.data.documents?.vehicle?.type || '',
        vehicleNumber: response.data.documents?.vehicle?.registrationNumber || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({ ...documents, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);

      if (profile?.role === 'driver') {
        formDataToSend.append('vehicleType', formData.vehicleType);
        formDataToSend.append('vehicleNumber', formData.vehicleNumber);
        
        Object.entries(documents).forEach(([key, file]) => {
          if (file) formDataToSend.append(key, file);
        });
      }

      await axios.put('http://localhost:5000/api/auth/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profile?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt={profile?.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer">
                      <Camera className="h-4 w-4 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{profile?.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
                  {profile?.isVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Driver-specific fields */}
              {profile?.role === 'driver' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Select vehicle type</option>
                        <option value="bike">Bike</option>
                        <option value="auto">Auto</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Aadhar Card */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card</label>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Front Side</label>
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Front
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'aadharFront')}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Back Side</label>
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Back
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'aadharBack')}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Driving License */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Driving License</label>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Front Side</label>
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Front
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'licenseFront')}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Back Side</label>
                                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                  <Upload className="h-5 w-5 mr-2" />
                                  Upload Back
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'licenseBack')}
                                    accept="image/*"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Vehicle Insurance */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Insurance</label>
                            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                              <Upload className="h-5 w-5 mr-2" />
                              Upload Insurance
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, 'insurance')}
                                accept="image/*,application/pdf"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;