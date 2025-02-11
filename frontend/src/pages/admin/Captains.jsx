
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";

const Captains = () => {
  const [captains, setCaptains] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchCaptains();
  }, []);

  const fetchCaptains = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/captains`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptains(res.data.captains);
    } catch (err) {
      showToast("Error fetching captains", "error");
    }
  };

  const toggleBlockCaptain = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `/admin-hubhaimere-sepanga-matlena/${
          status === "blocked" ? "unblock" : "block"
        }-captain/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptains(
        captains.map((captain) =>
          captain._id === id
            ? { ...captain, status: status === "blocked" ? "active" : "blocked" }
            : captain
        )
      );
      showToast(
        `Captain ${status === "blocked" ? "unblocked" : "blocked"} successfully`,
        "success"
      );
    } catch (err) {
      showToast("Error updating captain status", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <>
        <Navbar />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Captains</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {captains.map((captain) => (
            <div
              key={captain._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {captain.fullname.firstname} {captain.fullname.lastname}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      captain.status === "blocked"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {captain.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{captain.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="text-gray-700">{captain.vehicle.vehicleType}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleBlockCaptain(captain._id, captain.status)}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                    captain.status === "blocked"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {captain.status === "blocked" ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 animate-fade-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Captains;
