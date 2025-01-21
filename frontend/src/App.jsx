import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
import UserLogin from './pages/UserLogin';
import UserSignup from './pages/UserSignup';
import Captainlogin from './pages/Captainlogin';
import CaptainSignup from './pages/CaptainSignup';
import Home from './pages/Home';
import UserProtectWrapper from './pages/UserProtectWrapper';
import UserLogout from './pages/UserLogout';
import CaptainHome from './pages/CaptainHome';
import CaptainProtectWrapper from './pages/CaptainProtectWrapper';
import CaptainLogout from './pages/CaptainLogout';
import Riding from './pages/Riding';
import CaptainRiding from './pages/CaptainRiding';
import 'remixicon/fonts/remixicon.css';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div>
      {/* Conditionally render Navbar on all routes except Start */}
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <>
                <Navbar />
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
                <Navbar />
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
                <Navbar />
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
                <Navbar />
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
                <Navbar />
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
                <Navbar />
                <CaptainRiding />
              </>
            </CaptainProtectWrapper>
          }
        />
      </Routes>
    </div>
  );
};

export default App;