import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTP = ({ type, email, mobileNumber }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email: locationEmail, mobileNumber: locationMobileNumber } = location.state || {};

  const finalEmail = email || locationEmail;
  const finalMobileNumber = mobileNumber || locationMobileNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = type === 'email' ? 'verify-email-otp' : 'verify-mobile-otp';
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/${endpoint}`, {
        email: finalEmail,
        mobileNumber: finalMobileNumber,
        otp,
      });

      if (response.status === 200) {
        if (type === 'email') {
          navigate('/verify-mobile-otp', { state: { email: finalEmail, mobileNumber: finalMobileNumber } });
        } else {
          navigate('/captain-home');
        }
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify OTP</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              required
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;