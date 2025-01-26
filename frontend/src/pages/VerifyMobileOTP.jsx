import React from 'react';
import VerifyOTP from '../components/VerifyOTP';
import { useLocation } from 'react-router-dom';

const VerifyMobileOTP = () => {
  const location = useLocation();
  const { mobileNumber } = location.state || {};

  return <VerifyOTP type="mobile" mobileNumber={mobileNumber} />;
};

export default VerifyMobileOTP;