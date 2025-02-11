import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState({ totalUsers: 0, totalCaptains: 0, pendingRides: 0, completedRides: 0, totalEarnings: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/admin-hubhaimere-sepanga-matlena/dashboard", { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="p-4 bg-white shadow rounded">
            <p className="text-gray-600">{key.replace(/([A-Z])/g, " $1").trim()}</p>
            <h3 className="text-xl font-bold">{value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
