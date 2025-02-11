import React from "react";
import { Navigate } from "react-router-dom";

const AdminProtectWrapper = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};
export default AdminProtectWrapper;
