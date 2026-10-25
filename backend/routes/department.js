
const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// Get all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Departments load nahi hue." });
  }
});

// Add department
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department ka naam zaroori hai.",
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description || "",
    });

    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ye department pehle se mojood hai.",
      });
    }

    res.status(500).json({ message: "Department save nahi hua." });
  }
});

module.exports = router;
