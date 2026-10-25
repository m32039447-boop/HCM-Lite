
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// First-time Admin setup
router.post("/setup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 12
    ) {
      return res.status(400).json({
        message: "Name, valid email aur 12-character password zaroori hai.",
      });
    }

    // Check whether an Admin already exists
    const existingAdmin = await User.findOne({ role: "Admin" });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin pehle se maujood hai.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "Admin",
    });

    return res.status(201).json({
      message: "Admin account successfully create ho gaya. Ab login karein.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ye email pehle se registered hai.",
      });
    }

    console.error("Setup error:", error.message);
    return res.status(500).json({
      message: "Admin setup fail ho gaya.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email aur password enter karo.",
      });
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      return res.status(500).json({
        message: "Server JWT secret properly configured nahi hai.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Email ya password ghalat hai.",
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h", issuer: "hcm-lite" }
    );

    return res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login nahi ho saka.",
    });
  }
});

module.exports = router;
