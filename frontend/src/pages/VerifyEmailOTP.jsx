import React from 'react';
import VerifyOTP from '../components/VerifyOTP';
import { useLocation } from 'react-router-dom';

const VerifyEmailOTP = () => {
  const location = useLocation();
  const { email, mobileNumber, userType } = location.state || {};

  return <VerifyOTP type="email" email={email} mobileNumber={mobileNumber} userType={userType} />;
};

export default VerifyEmailOTP;