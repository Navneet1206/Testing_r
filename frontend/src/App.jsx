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
import VerifyEmailOTP from './pages/VerifyEmailOTP';
import VerifyMobileOTP from './pages/VerifyMobileOTP';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users';
import Captains from './pages/admin/Captains';
import RideManagement from './pages/admin/RideManagement';
import Payments from './pages/admin/Payments';
import AdminProtectWrapper from './pages/admin/AdminProtectWrapper';
import NotFoundPage from './pages/NotFoundPage';
import 'remixicon/fonts/remixicon.css';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/captain-login" element={<Captainlogin />} />
        <Route path="/captain-signup" element={<CaptainSignup />} />
        <Route path="/verify-email-otp" element={<VerifyEmailOTP />} />
        <Route path="/verify-mobile-otp" element={<VerifyMobileOTP />} />
        <Route path="/admin/login" element={<AdminLogin />} /> 

        {/* User Protected Routes */}
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/riding"
          element={
            <UserProtectWrapper>
              <Riding />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/user/history"
          element={
            <UserProtectWrapper>
              <UserRideHistory />
            </UserProtectWrapper>
          }
        />

        {/* Captain Protected Routes */}
        <Route
          path="/captain-home"
          element={
            <CaptainProtectWrapper>
              <CaptainHome />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain/logout"
          element={
            <CaptainProtectWrapper>
              <CaptainLogout />
            </CaptainProtectWrapper>
          }
        />
        <Route
          path="/captain-riding"
          element={
            <CaptainProtectWrapper>
              <CaptainRiding />
            </CaptainProtectWrapper>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectWrapper>
              <Dashboard />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectWrapper>
              <Users />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/captains"
          element={
            <AdminProtectWrapper>
              <Captains />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/rides"
          element={
            <AdminProtectWrapper>
              <RideManagement />
            </AdminProtectWrapper>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectWrapper>
              <Payments />
            </AdminProtectWrapper>
          }
        />
        
        {/* Fallback Route for 404 and wrong requests */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
