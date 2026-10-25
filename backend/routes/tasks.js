
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

// GET: Saare tasks hasil karo
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Tasks load nahi ho sake." });
  }
});

// POST: Naya task save karo
router.post("/", async (req, res) => {
  try {
    const { title, subject, dueDate, status } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        message: "Title aur subject zaroori hain.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      subject: subject.trim(),
      ...(dueDate ? { dueDate } : {}),
      ...(status ? { status } : {}),
    });

    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Task data valid nahi hai." });
    }
    res.status(500).json({ message: "Task save nahi ho saka." });
  }
});

// PATCH: Task update karo
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Task ID valid nahi hai." });
    }

    const updates = {};
    for (const field of ["title", "subject", "dueDate", "status"]) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Koi update field nahi di." });
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task nahi mila." });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Task update nahi ho saka." });
  }
});

// DELETE: Task delete karo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Task ID valid nahi hai." });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task nahi mila." });
    }

    res.json({ message: "Task successfully delete ho gaya." });
  } catch (error) {
    res.status(500).json({ message: "Task delete nahi ho saka." });
  }
});

module.exports = router;
