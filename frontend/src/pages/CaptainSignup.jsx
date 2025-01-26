// frontend/src/pages/CaptainSignup.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CapatainContext';
import 'remixicon/fonts/remixicon.css';

const CaptainSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  const { captain, setCaptain } = React.useContext(CaptainDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullname[firstname]', firstName);
    formData.append('fullname[lastname]', lastName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('vehicle[color]', vehicleColor);
    formData.append('vehicle[plate]', vehiclePlate);
    formData.append('vehicle[capacity]', vehicleCapacity);
    formData.append('vehicle[vehicleType]', vehicleType);
    formData.append('mobileNumber', mobileNumber);
    formData.append('drivingLicense', drivingLicense);
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/captains/register`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 201) {
      const data = response.data;
      setCaptain(data.captain);
      localStorage.setItem('token', data.token);
      navigate('/captain-home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <img
            className="w-20 mx-auto mb-4"
            src="https://www.svgrepo.com/show/505031/uber-driver.svg"
            alt="Captain Logo"
          />
          <h1 className="text-2xl font-bold text-gray-800">Create Captain Account</h1>
          <p className="text-gray-600">Join our fleet and start earning today!</p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                required
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                required
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              required
              type="text"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Driving License Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driving License
            </label>
            <input
              required
              type="text"
              placeholder="Driving License"
              value={drivingLicense}
              onChange={(e) => setDrivingLicense(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Profile Photo Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Color
                </label>
                <input
                  required
                  type="text"
                  placeholder="Vehicle Color"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Plate
                </label>
                <input
                  required
                  type="text"
                  placeholder="Vehicle Plate"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Capacity
                </label>
                <input
                  required
                  type="number"
                  placeholder="Vehicle Capacity"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                >
                  <option value="" disabled>
                    Select Vehicle Type
                  </option>
                  <option value="car">Car</option>
                  <option value="auto">Auto</option>
                  <option value="moto">Moto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300"
          >
            Create Captain Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/captain-login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            This site is protected by reCAPTCHA and the{' '}
            <span className="underline">Google Privacy Policy</span> and{' '}
            <span className="underline">Terms of Service apply</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptainSignup;