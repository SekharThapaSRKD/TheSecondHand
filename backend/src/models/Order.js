const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  address: { type: String, default: "" },
  paymentMethod: {
    type: String,
    enum: ["cod", "stripe", "khalti"],
    default: "cod",
  },
  paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
  status: {
    type: String,
    enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
    default: "placed",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
