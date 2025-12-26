const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "Bad auth" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ message: "Admin only" });
  next();
}

module.exports = { authMiddleware, adminOnly };
