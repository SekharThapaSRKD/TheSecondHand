const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  size: { type: String, default: "" },
  gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex" },
  category: { type: String, default: "Misc" },
  condition: {
    type: String,
    enum: ["new", "like-new", "good", "fair"],
    default: "good",
  },
  location: { type: String, default: "" },
  images: { type: [String], default: [] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"],
    default: "pending",
  },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
