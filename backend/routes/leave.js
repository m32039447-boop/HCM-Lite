const express = require("express");
const router = express.Router();

const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// Get all leave requests
router.get("/", async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Leave requests load nahi ho sakin",
      error: error.message,
    });
  }
});

// Create a leave request
router.post("/", async (req, res) => {
  try {
    const { employee, startDate, endDate, reason } = req.body;

    if (!employee || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        message: "Tamam fields fill karna zaroori hai",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date, start date se pehle nahi ho sakti",
      });
    }

    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        message: "Employee nahi mila",
      });
    }

    const leave = await Leave.create({
      employee,
      startDate,
      endDate,
      reason: reason.trim(),
    });

    const savedLeave = await Leave.findById(leave._id)
      .populate("employee");

    res.status(201).json({
      message: "Leave request save ho gayi",
      leave: savedLeave,
    });
  } catch (error) {
    res.status(500).json({
      message: "Leave request save nahi ho saki",
      error: error.message,
    });
  }
});

// Approve or reject a leave request
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status Approved ya Rejected hona chahiye",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("employee");

    if (!leave) {
      return res.status(404).json({
        message: "Leave request nahi mili",
      });
    }

    res.json({
      message: `Leave request ${status.toLowerCase()} ho gayi`,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      message: "Leave status update nahi hua",
      error: error.message,
    });
  }
});

module.exports = router;
