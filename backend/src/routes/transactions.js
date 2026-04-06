const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Product = require("../models/Product");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Manual sort helper - scratch logic (no .sort() method used)
function manualSortByDate(array, field, descending = true) {
  // Bubble sort - swap elements manually
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      const aVal = array[i][field];
      const bVal = array[j][field];
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      
      if (descending && bTime > aTime) {
        // Swap for descending order
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      } else if (!descending && bTime < aTime) {
        // Swap for ascending order
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
  }
  return array;
}

// Create a transaction (when buyer purchases an item)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, sellerId, amount, paymentMethod, type } = req.body;
    const buyerId = req.user.id;

    if (!productId || !sellerId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create transaction
    const transaction = new Transaction({
      type: type || "purchase",
      product: productId,
      seller: sellerId,
      buyer: buyerId,
      amount,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      transactionStatus: "completed",
    });

    await transaction.save();

    // Update user stats
    await User.findByIdAndUpdate(sellerId, { $inc: { totalSales: 1 } });
    await User.findByIdAndUpdate(buyerId, { $inc: { totalPurchases: 1 } });

    // Update product status to sold
    await Product.findByIdAndUpdate(productId, { status: "sold" });

    res.json({ message: "Transaction created", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions for a user (buyer or seller)
router.get("/user/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    // Manual sort by createdAt (newest first) - scratch logic
    manualSortByDate(transactions, "createdAt", true);

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get sales transactions for a user
router.get("/user/sales", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ seller: userId })
      .populate("product", "name price images")
      .populate("buyer", "name email");

    // Manual sort by createdAt (newest first) - scratch logic
    manualSortByDate(transactions, "createdAt", true);

    const stats = {
      totalSales: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get purchase transactions for a user
router.get("/user/purchases", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ buyer: userId })
      .populate("product", "name price images")
      .populate("seller", "name email");

    // Manual sort by createdAt (newest first) - scratch logic
    manualSortByDate(transactions, "createdAt", true);

    const stats = {
      totalPurchases: transactions.length,
      totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions (admin only)
router.get("/admin/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    // Manual sort by createdAt (newest first) - scratch logic
    manualSortByDate(transactions, "createdAt", true);

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get transactions for a specific user (admin only)
router.get("/admin/user/:userId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    // Manual sort by createdAt (newest first) - scratch logic
    manualSortByDate(transactions, "createdAt", true);

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update transaction status (admin only)
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionStatus, paymentStatus } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        ...(transactionStatus && { transactionStatus }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    res.json({ message: "Transaction updated", transaction: updatedTransaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a transaction (admin only)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Revert user stats
    await User.findByIdAndUpdate(transaction.seller, { $inc: { totalSales: -1 } });
    await User.findByIdAndUpdate(transaction.buyer, { $inc: { totalPurchases: -1 } });

    // Revert product status
    await Product.findByIdAndUpdate(transaction.product, { status: "approved" });

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top sellers (public endpoint) - written with scratch logic (no modules)
router.get("/top/sellers", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // Fetch all users from database
    const allUsers = await User.find();

    // Create a sellers array with their stats
    const sellers = [];
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      // Only include users who have made sales
      if (user.totalSales > 0) {
        sellers.push({
          userId: user._id,
          name: user.name,
          avatar: user.avatar,
          totalSales: user.totalSales,
          totalRevenue: user.totalRevenue,
          averageRating: user.averageRating,
          reviewCount: user.reviewCount,
          location: user.location,
        });
      }
    }

    // Sort sellers by total revenue (highest first) using manual sort
    for (let i = 0; i < sellers.length; i++) {
      for (let j = i + 1; j < sellers.length; j++) {
        if (sellers[j].totalRevenue > sellers[i].totalRevenue) {
          // Swap elements
          let temp = sellers[i];
          sellers[i] = sellers[j];
          sellers[j] = temp;
        }
      }
    }

    // Get top N sellers
    const topSellers = [];
    for (let i = 0; i < limit && i < sellers.length; i++) {
      topSellers.push(sellers[i]);
    }

    res.json({
      success: true,
      count: topSellers.length,
      topSellers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get top buyers (public endpoint) - written with scratch logic (no modules)
router.get("/top/buyers", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // Fetch all users from database
    const allUsers = await User.find();

    // Create a buyers array with their stats
    const buyers = [];
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      // Only include users who have made purchases
      if (user.totalPurchases > 0) {
        buyers.push({
          userId: user._id,
          name: user.name,
          avatar: user.avatar,
          totalPurchases: user.totalPurchases,
          totalSpent: user.totalSpent,
          averageRating: user.averageRating,
          location: user.location,
        });
      }
    }

    // Sort buyers by total spent (highest first) using manual sort
    for (let i = 0; i < buyers.length; i++) {
      for (let j = i + 1; j < buyers.length; j++) {
        if (buyers[j].totalSpent > buyers[i].totalSpent) {
          // Swap elements
          let temp = buyers[i];
          buyers[i] = buyers[j];
          buyers[j] = temp;
        }
      }
    }

    // Get top N buyers
    const topBuyers = [];
    for (let i = 0; i < limit && i < buyers.length; i++) {
      topBuyers.push(buyers[i]);
    }

    res.json({
      success: true,
      count: topBuyers.length,
      topBuyers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
