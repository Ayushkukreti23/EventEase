const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Auth middleware - token present:", !!token);

    if (!token) {
      console.log("Auth middleware - no token provided");
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - token decoded:", { userId: decoded.userId });

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("Auth middleware - user not found");
      return res.status(401).json({ message: "Invalid token." });
    }

    console.log("Auth middleware - user authenticated:", {
      userId: user._id,
      name: user.name,
      role: user.role,
    });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin role required." });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: "Access denied." });
  }
};

module.exports = { auth, adminAuth };
