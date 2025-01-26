import React from 'react';
import VerifyOTP from '../components/VerifyOTP';
import { useLocation } from 'react-router-dom';

const VerifyMobileOTP = () => {
  const location = useLocation();
  const { email, mobileNumber } = location.state || {};

  return <VerifyOTP type="mobile" email={email} mobileNumber={mobileNumber} />;
};

export default VerifyMobileOTP;