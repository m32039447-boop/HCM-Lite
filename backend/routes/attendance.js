
const express = require("express");
const mongoose = require("mongoose");
const { auth, requireRole } = require("../middleware/auth");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const router = express.Router();

// Get attendance records
router.get("/", auth, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid date." });
      }

      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate("employee", "employeeId name department designation")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load attendance." });
  }
});

// Mark attendance
router.post("/", auth, requireRole("Admin", "HR"), async (req, res) => {
  try {
    const { employee, date, status, remarks = "" } = req.body;

    if (
      !mongoose.isValidObjectId(employee) ||
      !date ||
      !["Present", "Absent", "Late", "Half Day"].includes(status)
    ) {
      return res.status(400).json({
        message: "Valid employee, date, and status are required.",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    end.setUTCHours(23, 59, 59, 999);

    const record = await Attendance.findOneAndUpdate(
      { employee, date: { $gte: start, $lte: end } },
      { $set: { employee, date: start, status, remarks } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Attendance saved successfully.",
      attendance: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already exists for this employee and date.",
      });
    }

    res.status(500).json({ message: "Failed to save attendance." });
  }
});

module.exports = router;
