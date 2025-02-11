const Razorpay = require("razorpay");
const PaymentTransaction = require("../models/PaymentTransaction.model");
const Ride = require("../models/ride.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("🔑 Razorpay Secret:", process.env.RAZORPAY_SECRET ? "Loaded ✅" : "Not Loaded ❌");

// ✅ Create Razorpay Order
module.exports.createOrder = async (amount, rideId) => {
  const options = {
    amount: amount * 100, // Convert ₹ to paise
    currency: "INR",
    receipt: `receipt_${rideId}`,
    payment_capture: 1,
  };

  return await razorpay.orders.create(options);
};

// ✅ Verify Payment & Update Ride
module.exports.verifyPayment = async (rideId, orderId, transactionId) => {
  try {
    // Fetch payment from Razorpay
    const payment = await razorpay.payments.fetch(transactionId);
    if (payment.status !== "captured") {
      throw new Error("Payment verification failed");
    }

    // ✅ Store Payment Transaction
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error("Ride not found");

    const newPayment = new PaymentTransaction({
      ride: rideId,
      user: ride.user,
      transactionId,
      orderId,
      amount: ride.fare,
      paymentMethod: "online",
      paymentStatus: "done",
    });
    await newPayment.save();

    // ✅ Update Ride Payment Status
    ride.isPaymentDone = true;
    ride.paymentType = "online";
    await ride.save();

    return { success: true, ride };
  } catch (error) {
    throw new Error(error.message);
  }
};
