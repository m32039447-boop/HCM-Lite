
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const payrollRoutes = require("./routes/payroll");
const departmentRoutes = require("./routes/department");

const app = express();
const leaveRoutes = require("./routes/leave");

app.use(cors());
app.use(express.json());

app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/departments", departmentRoutes);
app.get("/", (req, res) => {
  res.send("Saylani Hackathon Backend is Running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
