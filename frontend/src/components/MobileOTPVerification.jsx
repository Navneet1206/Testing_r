import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MobileOTPVerification = ({ mobileNumber }) => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/verify-mobile-otp`, {
        mobileNumber,
        otp,
      });

      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <div>
      <h2>Verify Mobile OTP</h2>
      <form onSubmit={submitHandler}>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default MobileOTPVerification;