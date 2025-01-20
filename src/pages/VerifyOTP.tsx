import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('emailForOTP'); // Fetch email from local storage

  useEffect(() => {
    if (!email) {
      navigate('/register'); // Redirect to register if no email is found
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      alert(response.data.message); // Success message
      localStorage.removeItem('emailForOTP'); // Clear email from local storage
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
      <input
        type="text"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
        placeholder="Enter your OTP"
        required
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Verify
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default VerifyOTP;
