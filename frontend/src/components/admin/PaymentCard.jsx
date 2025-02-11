const PaymentCard = ({ payment }) => {
    return (
      <div className="bg-white shadow-md p-4 rounded-md">
        <h3 className="text-lg font-bold">₹{payment.amount}</h3>
        <p className="text-gray-600">User: {payment.user.fullname.firstname} {payment.user.fullname.lastname}</p>
        <p className="text-gray-600">Method: {payment.paymentMethod}</p>
        <p className={`text-sm ${payment.paymentStatus === "done" ? "text-green-500" : "text-red-500"}`}>{payment.paymentStatus}</p>
      </div>
    );
  };
  
  export default PaymentCard;
  