const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Stripe = require("stripe");
const { sendOrderConfirmation, sendSellerNotification } = require("../utils/email");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Create an order (from cart or items payload)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      items,
      address = "",
      paymentMethod = "cod",
      paymentResult,
    } = req.body;

    let orderItems = items;
    if (!orderItems || orderItems.length === 0) {
      // try to take from cart
      const cart = await Cart.findOne({ user: req.user.id })
        .populate("items.product")
        .exec();
      if (!cart || !cart.items.length)
        return res.status(400).json({ message: "Cart is empty" });
      orderItems = cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.price,
      }));
    }

    const total = orderItems.reduce(
      (s, it) => s + (it.price || 0) * (it.quantity || 1),
      0
    );

    // SECURITY CHECK: Verify user is not trying to buy their own items
    const productIds = orderItems.map((i) => i.product);
    const productsToCheck = await Product.find({ _id: { $in: productIds } }).select("seller");
    for (const product of productsToCheck) {
      if (product.seller && product.seller.toString() === req.user.id) {
        return res.status(403).json({ message: "You cannot buy your own items" });
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      address,
      paymentMethod,
    });

    // Mark products as sold
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { status: "sold" } }
    );

    // Update Buyer Stats
    const totalQty = orderItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalPurchases: totalQty },
    });

    // Update Seller Stats
    const qtyMap = {};
    orderItems.forEach((i) => {
      qtyMap[i.product] = i.quantity || 1;
    });
    const soldProducts = await Product.find({ _id: { $in: productIds } });
    for (const p of soldProducts) {
      if (p.seller) {
        await User.findByIdAndUpdate(p.seller, {
          $inc: { totalSales: qtyMap[p._id] || 1 },
        });
      }
    }

    // if paymentMethod is cod, mark unpaid; if stripe and paymentResult provided, attempt to verify
    if (
      paymentMethod === "stripe" &&
      paymentResult &&
      paymentResult.session_id
    ) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          paymentResult.session_id
        );
        if (session && session.payment_status === "paid") {
          order.paymentStatus = "paid";
          await order.save();
        }
      } catch (e) {
        console.warn("Stripe verify failed", e && e.message);
      }
    }

    // CREATE TRANSACTIONS for each product sold and update revenue
    for (const item of orderItems) {
      try {
        const product = soldProducts.find(p => p._id.toString() === item.product.toString());
        if (product && product.seller) {
          // Create transaction record (always "sale" - signifies a product was sold)
          await Transaction.create({
            type: "sale", // Product was sold
            product: item.product,
            seller: product.seller,
            buyer: req.user.id,
            amount: item.price,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === "cod" ? "unpaid" : (order.paymentStatus || "unpaid"),
            transactionStatus: "completed",
          });
          
          // Update seller's revenue
          await User.findByIdAndUpdate(product.seller, {
            $inc: { totalRevenue: item.price },
          });
        }
      } catch (e) {
        console.error("Failed to create transaction for product", item.product, e);
      }
    }

    // Update buyer's total spent
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalSpent: total },
    });

    // remove cart after order placed
    await Cart.findOneAndDelete({ user: req.user.id }).exec();

    // Send confirmation email to Buyer (async)
    const userEmail = req.user.email;
    sendOrderConfirmation(userEmail, order, orderItems).catch(err => 
      console.error("Failed to send buyer email:", err)
    );

    // Send notification emails to Sellers (async)
    // Group sold items by seller ID to send batched emails if a seller sold multiple items
    const sellerItemsMap = {};
    for (const item of orderItems) {
      // Find the product to get the seller ID
      const product = soldProducts.find(p => p._id.toString() === item.product.toString());
      if (product && product.seller) {
        const sellerId = product.seller.toString();
        if (!sellerItemsMap[sellerId]) {
          sellerItemsMap[sellerId] = [];
        }
        sellerItemsMap[sellerId].push({
          id: product._id,
          name: product.name
        });
      }
    }

    // Iterate through sellers and send emails
    Object.keys(sellerItemsMap).forEach(async (sellerId) => {
      try {
        const seller = await User.findById(sellerId);
        if (seller && seller.email) {
            sendSellerNotification(seller.email, sellerItemsMap[sellerId]).catch(err =>
                console.error(`Failed to send seller email to ${seller.email}:`, err)
            );
        }
      } catch (err) {
        console.error("Error fetching seller for email:", err);
      }
    });

    res.json({ ok: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Get user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .exec();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
