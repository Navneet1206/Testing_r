import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div className="space-x-4">
        <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/admin/users" className="hover:underline">Users</Link>
        <Link to="/admin/captains" className="hover:underline">Captains</Link>
        <Link to="/admin/rides" className="hover:underline">Rides</Link>
        <Link to="/admin/payments" className="hover:underline">Payments</Link>
      </div>
    </nav>
  );
};

export default Navbar;
