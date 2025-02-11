import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/admin-hubhaimere-sepanga-matlena/login", {
        email,
        password,
      });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-2 border rounded" required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mt-2 border rounded" required />
        <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
