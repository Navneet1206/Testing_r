import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/admin/Navbar";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin-hubhaimere-sepanga-matlena/payments`, { headers: { Authorization: `Bearer ${token}` } });
        setPayments(res.data.payments);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, []);

  return (<> 
      <Navbar />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <table className="w-full bg-white shadow-lg rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Method</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id} className="border-b">
              <td className="p-3">{payment.user.fullname.firstname} {payment.user.fullname.lastname}</td>
              <td className="p-3">₹{payment.amount}</td>
              <td className="p-3">{payment.paymentMethod}</td>
              <td className={`p-3 ${payment.paymentStatus === "done" ? "text-green-500" : "text-red-500"}`}>{payment.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
  );
};

export default Payments;
