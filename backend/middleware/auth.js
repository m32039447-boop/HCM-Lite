
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Login zaroori hai.",
      });
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      return res.status(500).json({
        message: "Server security configuration error.",
      });
    }

    const token = header.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "hcm-lite",
    });

    const user = await User.findOne({
      _id: decoded.sub,
      isActive: true,
    });

    if (!user || user.role !== decoded.role) {
      return res.status(401).json({
        message: "Account valid nahi hai. Dobara login karein.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalid ya expire ho gaya. Dobara login karein.",
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Aapko is action ki permission nahi hai.",
      });
    }

    next();
  };
}

module.exports = { auth, requireRole };
