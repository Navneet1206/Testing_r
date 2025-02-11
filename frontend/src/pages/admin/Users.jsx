import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.users);
    } catch (err) {
      showToast("Error fetching users", "error");
    }
  };

  const toggleBlockUser = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/${
          status === "blocked" ? "unblock" : "block"
        }-user/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user._id === id
            ? { ...user, status: status === "blocked" ? "active" : "blocked" }
            : user
        )
      );
      showToast(
        `User ${status === "blocked" ? "unblocked" : "blocked"} successfully`,
        "success"
      );
    } catch (err) {
      showToast("Error updating user status", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.fullname.firstname} {user.fullname.lastname}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === "blocked"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{user.email}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleBlockUser(user._id, user.status)}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                    user.status === "blocked"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {user.status === "blocked" ? "Unblock" : "Block"}
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
  );
};

export default Users;
