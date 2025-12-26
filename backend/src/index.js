const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const paymentRoutes = require("./routes/payments");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Serve uploaded files
const fs = require("fs");
const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

async function bootstrapAdmin() {
  const adminEmail = "admin@thrift.com";
  const existing = await User.findOne({ email: adminEmail }).exec();
  if (!existing) {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("adminpass", 10);
    await User.create({
      name: "Admin User",
      email: adminEmail,
      password: hash,
      isAdmin: true,
    });
    console.log("Bootstrapped admin user: admin@thrift.com / adminpass");
  }
}

const connectOptions = { serverSelectionTimeoutMS: 5000, family: 4 };

mongoose
  .connect(MONGODB_URI, connectOptions)
  .then(async () => {
    console.log("Connected to MongoDB");
    await bootstrapAdmin();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    const msg = err && err.message ? err.message : String(err);
    console.error("MongoDB connection error:");
    console.error(msg);
    console.error();
    console.error("Tried to connect using:", maskConnectionString(MONGODB_URI));
    console.error(
      "Ensure MongoDB is reachable (start local mongod or use Docker/Atlas)."
    );
    process.exit(1);
  });

function maskConnectionString(conn) {
  try {
    // mask credentials in mongodb connection string
    // e.g. mongodb+srv://user:pass@host/db -> mongodb+srv://***:***@host/db
    return conn.replace(/:\/\/([^:@]+):([^@]+)@/, "://***:***@");
  } catch (e) {
    return conn;
  }
}
