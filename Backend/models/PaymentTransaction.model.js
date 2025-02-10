const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ride",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  transactionId: {
    type: String, // e.g. Razorpay Payment ID (for online payments)
  },
  orderId: {
    type: String, // Razorpay Order ID
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "cash"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["done", "not_done"],
    default: "not_done",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
