
const express = require("express");
const mongoose = require("mongoose");
const Payroll = require("../models/Payroll");

const router = express.Router();

// Get all payroll records
router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employee")
      .sort({ createdAt: -1 });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: "Payroll records load nahi huay." });
  }
});

// Create a payroll record
router.post("/", async (req, res) => {
  try {
    const { employee, month, basicSalary, bonus = 0, deductions = 0 } = req.body;

    if (!employee || !month || basicSalary === undefined) {
      return res.status(400).json({
        message: "Employee, month aur basic salary zaroori hain.",
      });
    }

    if (!mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Employee ID valid nahi hai." });
    }

    const salary = Number(basicSalary);
    const extra = Number(bonus);
    const minus = Number(deductions);

    if (
      !Number.isFinite(salary) ||
      !Number.isFinite(extra) ||
      !Number.isFinite(minus) ||
      salary < 0 ||
      extra < 0 ||
      minus < 0 ||
      minus > salary + extra
    ) {
      return res.status(400).json({
        message: "Salary, bonus aur deductions ki amounts check karo.",
      });
    }

    const netSalary = salary + extra - minus;

    const payroll = await Payroll.create({
      employee,
      month,
      basicSalary: salary,
      bonus: extra,
      deductions: minus,
      netSalary,
    });

    const savedPayroll = await Payroll.findById(payroll._id).populate("employee");

    res.status(201).json(savedPayroll);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Is employee ka payroll is month ke liye pehle se maujood hai.",
      });
    }

    res.status(500).json({ message: "Payroll save nahi hua." });
  }
});

// Update payment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Status Pending ya Paid hona chahiye." });
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("employee");

    if (!payroll) {
      return res.status(404).json({ message: "Payroll record nahi mila." });
    }

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: "Payroll status update nahi hua." });
  }
});

module.exports = router;
