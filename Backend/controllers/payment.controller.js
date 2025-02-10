const paymentService = require("../services/payment.service");
const { sendEmail } = require("../services/communication.service");

// ✅ Create Order for Payment Gateway
module.exports.createOrder = async (req, res) => {
  const { amount, rideId } = req.body;
  try {
    const order = await paymentService.createOrder(amount, rideId);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating payment order" });
  }
};

// ✅ Verify Payment
module.exports.verifyPayment = async (req, res) => {
  const { rideId, orderId, transactionId } = req.body;
  try {
    const result = await paymentService.verifyPayment(rideId, orderId, transactionId);

    // 📧 Send Payment Confirmation Email
    const emailContent = `
      <p>Your ride has been confirmed.</p>
      <p>Payment Status: Done</p>
      <p>Amount: ₹${result.ride.fare}</p>
    `;
    await sendEmail(result.ride.user.email, "Payment Confirmation", emailContent);
    await sendEmail(process.env.ADMIN_EMAIL, "New Ride Payment", emailContent);

    res.json({ message: "Payment verified successfully", ride: result.ride });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
