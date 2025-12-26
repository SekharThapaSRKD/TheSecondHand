const express = require("express");
const Product = require("../models/Product");
const User = require("../models/User");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();
const Review = require("../models/Review");
const path = require("path");

let multer;
let upload;
try {
  multer = require("multer");
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // routes are in src/routes, go up two levels to reach backend/uploads
      cb(null, path.resolve(__dirname, "..", "..", "uploads"));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith("image/"))
      cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  };

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });
} catch (e) {
  console.warn("multer not installed; product image uploads will be no-ops.");
  upload = { array: () => (req, res, next) => next() };
}

// Get specific routes BEFORE /:id to avoid collision
router.get("/pending", async (req, res) => {
  try {
    console.log("Fetching pending products");
    // return newest pending items first so admins review recent uploads first
    const products = await Product.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("seller", "-password")
      .exec();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats: top sellers by number of approved products
// MOVED BEFORE /:id because "stats" would otherwise be matched as an id
// Stats: Top Sellers (Weighted Ranking Algorithm)
// Formula: Score = (Sales × 0.7) + (Rating × Reviews × 0.2) + (Reviews × 0.1)
// This prioritizes sales volume while rewarding quality sellers with good ratings
router.get("/stats/top-sellers", async (req, res) => {
  try {
    // Fetch users who have sold items
    const sellers = await User.find({ totalSales: { $gt: 0 } })
      .select("-password")
      .lean();

    // Calculate weighted score
    sellers.forEach((s) => {
      const sales = s.totalSales || 0;
      const rating = s.averageRating || 0;
      const reviews = s.reviewCount || 0;
      
      // Weighted formula:
      // - 70% weight on sales (main factor)
      // - 20% weight on rating quality (rating * review count for credibility)
      // - 10% weight on review count (engagement)
      s.score = (sales * 0.7) + (rating * reviews * 0.2) + (reviews * 0.1);
    });

    sellers.sort((a, b) => b.score - a.score);

    res.json({ sellers: sellers.slice(0, 5) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats: Top Buyers
router.get("/stats/top-buyers", async (req, res) => {
  try {
    const buyers = await User.find({ totalPurchases: { $gt: 0 } })
      .sort({ totalPurchases: -1 })
      .limit(5)
      .select("-password")
      .exec();
    res.json({ buyers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Stats: Get unique locations from products
router.get("/stats/locations", async (req, res) => {
  try {
    const locations = await Product.distinct("location", { 
      status: "approved",
      location: { $ne: "" } // Exclude empty locations
    });
    res.json({ locations: locations.sort() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("seller", "-password")
      .exec();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product by id
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id)
      .populate("seller", "-password")
      .exec();
    if (!p) return res.status(404).json({ message: "Not found" });
    
    // Increment view count
    p.views = (p.views || 0) + 1;
    await p.save();
    
    res.json({ product: p });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get reviews for a product
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 })
      .exec();
    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a review to product (and seller)
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id).exec();
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Optional: prevent a user from reviewing their own product
    if (product.seller.toString() === req.user.id)
      return res
        .status(400)
        .json({ message: "Cannot review your own product" });

    // Ensure rating is valid
    const r = Number(rating) || 0;
    if (r < 1 || r > 5)
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });

    const review = await Review.create({
      product: product._id,
      reviewer: req.user.id,
      seller: product.seller,
      rating: r,
      comment: comment || "",
    });

    // Recalculate product averages
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: "$product",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]).exec();
    if (agg && agg.length) {
      product.averageRating = agg[0].avg;
      product.reviewCount = agg[0].count;
      await product.save();
    }

    // Recalculate seller averages
    const sellerAgg = await Review.aggregate([
      { $match: { seller: product.seller } },
      {
        $group: {
          _id: "$seller",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]).exec();
    if (sellerAgg && sellerAgg.length) {
      const seller = await User.findById(product.seller).exec();
      if (seller) {
        seller.averageRating = sellerAgg[0].avg;
        seller.reviewCount = sellerAgg[0].count;
        await seller.save();
      }
    }

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name email")
      .exec();
    res.json({ review: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create product (supports multipart/form-data with `images` files)
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    // fields may come from req.body (JSON) or req.body when multipart parsed by multer
    const {
      name,
      description,
      price,
      size,
      gender,
      category,
      condition,
      location,
    } = req.body;

    // Build images array from uploaded files if present
    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.body.images) {
      try {
        images = Array.isArray(req.body.images)
          ? req.body.images
          : JSON.parse(req.body.images);
      } catch (e) {
        images = typeof req.body.images === "string" ? [req.body.images] : [];
      }
    }

    if (!name || !price)
      return res.status(400).json({ message: "Missing fields" });
    try {
      const seller = await User.findById(req.user.id).exec();
      if (!seller) return res.status(400).json({ message: "Seller not found" });
      const product = await Product.create({
        name,
        description,
        price,
        size,
        gender,
        category,
        condition,
        location,
        images: Array.isArray(images) ? images : [],
        seller: seller._id,
      });
      const populated = await Product.findById(product._id)
        .populate("seller", "-password")
        .exec();
      res.json({ product: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);



// Update product (admin only - can edit any product)
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const {
        name,
        description,
        price,
        size,
        gender,
        category,
        condition,
        location,
        status,
      } = req.body;

      // Update basic fields if provided
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (size !== undefined) product.size = size;
      if (gender !== undefined) product.gender = gender;
      if (category !== undefined) product.category = category;
      if (condition !== undefined) product.condition = condition;
      if (location !== undefined) product.location = location;
      if (status !== undefined) product.status = status;

      // Handle image updates
      if (req.files && Array.isArray(req.files) && req.files.length) {
        // New images uploaded, replace existing
        product.images = req.files.map((f) => `/uploads/${f.filename}`);
      } else if (req.body.images) {
        // Images provided in body (JSON array or string)
        try {
          product.images = Array.isArray(req.body.images)
            ? req.body.images
            : JSON.parse(req.body.images);
        } catch (e) {
          // If parsing fails, keep existing images
        }
      }

      await product.save();
      const populated = await Product.findById(product._id)
        .populate("seller", "-password")
        .exec();
      res.json({ product: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a product (only by seller or admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check ownership
    if (
      product.seller.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/approve", authMiddleware, adminOnly, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).exec();
    if (!p) return res.status(404).json({ message: "Not found" });
    p.status = "approved";
    await p.save();
    const populated = await p.populate("seller", "-password");
    res.json({ product: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/reject", authMiddleware, adminOnly, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).exec();
    if (!p) return res.status(404).json({ message: "Not found" });
    p.status = "rejected";
    await p.save();
    const populated = await Product.findById(p._id)
      .populate("seller", "-password")
      .exec();
    res.json({ product: populated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Stats: top sellers by number of approved products


module.exports = router;
