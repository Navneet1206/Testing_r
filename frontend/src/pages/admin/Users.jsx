import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/admin-hubhaimere-sepanga-matlena/users", { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const toggleBlockUser = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(`/admin-hubhaimere-sepanga-matlena/${status === "blocked" ? "unblock" : "block"}-user/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(user => (user._id === id ? { ...user, status: status === "blocked" ? "active" : "blocked" } : user)));
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full bg-white shadow-lg rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b">
              <td className="p-3">{user.fullname.firstname} {user.fullname.lastname}</td>
              <td className="p-3">{user.email}</td>
              <td className={`p-3 ${user.status === "blocked" ? "text-red-500" : "text-green-500"}`}>{user.status}</td>
              <td className="p-3">
                <button onClick={() => toggleBlockUser(user._id, user.status)} className={`p-2 text-white rounded ${user.status === "blocked" ? "bg-green-500" : "bg-red-500"}`}>
                  {user.status === "blocked" ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
