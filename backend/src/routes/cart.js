const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get current user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .exec();
    res.json(cart || { items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// Add or update item in cart
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId)
      return res.status(400).json({ message: "Missing productId" });

    const product = await Product.findById(productId).exec();
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id }).exec();
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx === -1) {
      cart.items.push({ product: productId, quantity, price: product.price });
    } else {
      cart.items[idx].quantity = quantity;
      cart.items[idx].price = product.price;
    }

    cart.updatedAt = new Date();
    await cart.save();
    const full = await Cart.findById(cart._id).populate("items.product").exec();
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// Update quantity
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId)
      return res.status(400).json({ message: "Missing productId" });
    const cart = await Cart.findOne({ user: req.user.id }).exec();
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx === -1)
      return res.status(404).json({ message: "Item not in cart" });
    cart.items[idx].quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    const full = await Cart.findById(cart._id).populate("items.product").exec();
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// Remove item
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id }).exec();
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    const full = await Cart.findById(cart._id).populate("items.product").exec();
    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

// Clear cart
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id }).exec();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

module.exports = router;
