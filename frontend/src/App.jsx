import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import Captainlogin from './pages/Captainlogin';
import CaptainSignup from './pages/CaptainSignup';
import UserRideHistory from './pages/UserRideHistory';
import Home from './pages/Home';
import UserProtectWrapper from './pages/UserProtectWrapper';
import UserLogout from './pages/UserLogout';
import CaptainHome from './pages/CaptainHome';
import CaptainProtectWrapper from './pages/CaptainProtectWrapper';
import CaptainLogout from './pages/CaptainLogout';
import Riding from './pages/Riding';
import CaptainRiding from './pages/CaptainRiding';
import 'remixicon/fonts/remixicon.css';
import VerifyEmailOTP from './pages/VerifyEmailOTP';
import VerifyMobileOTP from './pages/VerifyMobileOTP';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="/verify-email-otp" element={<VerifyEmailOTP />} />
        <Route path="/verify-mobile-otp" element={<VerifyMobileOTP />} />
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <>
                
                <Home />
              </>
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <>
                
                <UserLogout />
              </>
            </UserProtectWrapper>
          }
        />
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <>
                
                <CaptainHome />
              </>
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain/logout"
          element={
            <CaptainProtectWrapper>
              <>
                
                <CaptainLogout />
              </>
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/riding"
          element={
            <UserProtectWrapper>
              <>
                
                <Riding />
              </>
            </UserProtectWrapper>
          }
        />
        <Route
          path="/captain-riding"
          element={
            <CaptainProtectWrapper>
              <>
                
                <CaptainRiding />
              </>
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/user/history"
          element={
            <CaptainProtectWrapper>
              <>
                
                <UserRideHistory />
              </>
            </CaptainProtectWrapper>
          }
        />
      </Routes>
    </div>
  );
};

export default App;