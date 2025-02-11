import { useEffect, useState } from "react";
import axios from "axios";

const Captains = () => {
  const [captains, setCaptains] = useState([]);

  useEffect(() => {
    const fetchCaptains = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/captains`, { headers: { Authorization: `Bearer ${token}` } });
        setCaptains(res.data.captains);
      } catch (err) {
        console.error("Error fetching captains:", err);
      }
    };
    fetchCaptains();
  }, []);

  const toggleBlockCaptain = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`/admin-hubhaimere-sepanga-matlena/${status === "blocked" ? "unblock" : "block"}-captain/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setCaptains(captains.map(captain => (captain._id === id ? { ...captain, status: status === "blocked" ? "active" : "blocked" } : captain)));
    } catch (err) {
      console.error("Error toggling captain status:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Captains</h1>
      <table className="w-full bg-white shadow-lg rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Vehicle</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {captains.map((captain) => (
            <tr key={captain._id} className="border-b">
              <td className="p-3">{captain.fullname.firstname} {captain.fullname.lastname}</td>
              <td className="p-3">{captain.email}</td>
              <td className="p-3">{captain.vehicle.vehicleType}</td>
              <td className={`p-3 ${captain.status === "blocked" ? "text-red-500" : "text-green-500"}`}>{captain.status}</td>
              <td className="p-3">
                <button onClick={() => toggleBlockCaptain(captain._id, captain.status)} className={`p-2 text-white rounded ${captain.status === "blocked" ? "bg-green-500" : "bg-red-500"}`}>
                  {captain.status === "blocked" ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Captains;
