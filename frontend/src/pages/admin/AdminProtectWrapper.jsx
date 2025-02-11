import { Navigate, Outlet } from "react-router-dom";

const AdminProtectWrapper = () => {
  const isAuthenticated = !!localStorage.getItem("adminToken");

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminProtectWrapper;
