
const express = require("express");
const Employee = require("../models/Employee");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Sirf logged-in Admin aur HR access kar sakte hain
router.use(auth);
router.use(requireRole("Admin", "HR"));

// Employees ki list
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Employees load nahi huay." });
  }
});

// Naya employee add karo
router.post("/", async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      department,
      designation,
      joiningDate,
    } = req.body;

    if (
      !employeeId?.trim() ||
      !name?.trim() ||
      !email?.trim() ||
      !department?.trim() ||
      !designation?.trim() ||
      !joiningDate
    ) {
      return res.status(400).json({
        message: "Tamam employee fields fill karna zaroori hai.",
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      designation: designation.trim(),
      joiningDate,
    });

    res.status(201).json({
      message: "Employee successfully add ho gaya!",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Employee ID ya email pehle se registered hai.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Employee details check karo.",
      });
    }

    res.status(500).json({ message: "Employee add nahi ho saka." });
  }
});



/* Update employee details */
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "employeeId",
      "name",
      "email",
      "department",
      "designation",
      "joiningDate",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Update karne ke liye details zaroori hain.",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee nahi mila.",
      });
    }

    res.json({
      message: "Employee details update ho gayi hain.",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Employee ID ya email pehle se registered hai.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Employee details check karo.",
      });
    }

    res.status(500).json({
      message: "Employee update nahi ho saka.",
    });
  }
});

/* Activate or deactivate an employee */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status Active ya Inactive hona chahiye.",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee nahi mila.",
      });
    }

    res.json({
      message: `Employee status ${status} ho gaya.`,
      employee,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Employee ID valid nahi hai.",
      });
    }

    res.status(500).json({
      message: "Employee status update nahi ho saka.",
    });
  }
});
module.exports = router;
