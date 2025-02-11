import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4 fixed">
      <h2 className="text-xl font-semibold mb-6">Admin Menu</h2>
      <ul className="space-y-4">
        <li><Link to="/admin/dashboard" className="block p-2 hover:bg-gray-700 rounded">Dashboard</Link></li>
        <li><Link to="/admin/users" className="block p-2 hover:bg-gray-700 rounded">Users</Link></li>
        <li><Link to="/admin/captains" className="block p-2 hover:bg-gray-700 rounded">Captains</Link></li>
        <li><Link to="/admin/rides" className="block p-2 hover:bg-gray-700 rounded">Rides</Link></li>
        <li><Link to="/admin/payments" className="block p-2 hover:bg-gray-700 rounded">Payments</Link></li>
        <li><button onClick={() => localStorage.removeItem("adminToken")} className="block p-2 w-full text-left hover:bg-red-600 rounded">Logout</button></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
