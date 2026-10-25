
import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000/api/auth";
const EMPLOYEE_API = "http://localhost:5000/api/employees";
const ATTENDANCE_API = "http://localhost:5000/api/attendance";
const LEAVE_API = "http://localhost:5000/api/leaves";
const PAYROLL_API = "http://localhost:5000/api/payroll";
const DEPARTMENT_API = "http://localhost:5000/api/departments";

const menuItems = [
  { name: "Dashboard", icon: "▦" },
  { name: "Employees", icon: "♙" },
  { name: "Attendance", icon: "◷" },
  { name: "Leave Management", icon: "▤" },
  { name: "Payroll", icon: "＄" },
  { name: "Departments", icon: "⌂" },
];

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  joiningDate: getToday(),
};

const emptyLeaveForm = {
  employee: "",
  startDate: getToday(),
  endDate: getToday(),
  reason: "",
};

const emptyPayrollForm = {
  employee: "",
  month: getToday().slice(0, 7),
  basicSalary: "",
  bonus: "0",
  deductions: "0",
};

function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(getToday());
  const [attendanceForm, setAttendanceForm] = useState({
    employee: "",
    status: "Present",
    remarks: "",
  });
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [leaveMessage, setLeaveMessage] = useState("");
  const [leaveForm, setLeaveForm] = useState(emptyLeaveForm);
  const [savingLeave, setSavingLeave] = useState(false);
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState("");
  const [payrollMessage, setPayrollMessage] = useState("");
  const [payrollForm, setPayrollForm] = useState(emptyPayrollForm);
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [updatingPayrollId, setUpdatingPayrollId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState("");
  const [departmentMessage, setDepartmentMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login nahi ho saka.");
      }

      setToken(data.token);
      setUser(data.user);
      setPassword("");
      setActivePage("Dashboard");
    } catch (err) {
      setError(err.message || "Backend se connection nahi hua.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees(currentToken = token) {
    if (!currentToken) return;

    setEmployeesLoading(true);
    setEmployeeError("");

    try {
      const response = await fetch(EMPLOYEE_API, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Employees load nahi huay.");
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setEmployeeError(err.message || "Employees load nahi huay.");
    } finally {
      setEmployeesLoading(false);
    }
  }

  async function loadAttendance(currentToken = token, date = attendanceDate) {
    if (!currentToken) return;

    setAttendanceLoading(true);
    setAttendanceError("");
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : "";
      const response = await fetch(`${ATTENDANCE_API}${query}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Attendance load nahi hui.");
      }
      setAttendanceRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setAttendanceError(err.message || "Attendance load nahi hui.");
    } finally {
      setAttendanceLoading(false);
    }
  }


  async function loadLeaves(currentToken = token) {
    if (!currentToken) return;
    setLeaveLoading(true);
    setLeaveError("");
    try {
      const response = await fetch(LEAVE_API, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Leave requests load nahi huay.");
      setLeaveRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setLeaveError(err.message || "Leave requests load nahi huay.");
    } finally {
      setLeaveLoading(false);
    }
  }

useEffect(() => {
  if (!user || !token) return;

  if (
    ["Dashboard", "Employees", "Attendance", "Leave Management", "Payroll"].includes(
      activePage
    )
  ) {
    loadEmployees(token);
  }

  if (activePage === "Dashboard") {
    loadAttendance(token, getToday());
  } else if (activePage === "Attendance") {
    loadAttendance(token, attendanceDate);
  }

  if (activePage === "Leave Management") {
    loadLeaves(token);
  }

  if (activePage === "Payroll") {
    loadPayroll(token);
  }

  if (activePage === "Departments") {
    loadDepartments(token);
  }
}, [user, token, activePage, attendanceDate]);

async function loadPayroll(currentToken = token) {
  if (!currentToken) return;

  setPayrollLoading(true);
  setPayrollError("");

  try {
    const response = await fetch(PAYROLL_API, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payroll records load nahi huay.");
    }

    setPayrollRecords(Array.isArray(data) ? data : []);
  } catch (err) {
    setPayrollError(err.message || "Payroll records load nahi huay.");
  } finally {
    setPayrollLoading(false);
  }
}

async function handleSavePayroll(event) {
  event.preventDefault();
  setSavingPayroll(true);
  setPayrollError("");
  setPayrollMessage("");

  const basicSalary = Number(payrollForm.basicSalary);
  const bonus = Number(payrollForm.bonus);
  const deductions = Number(payrollForm.deductions);
  const netSalary = basicSalary + bonus - deductions;

  if (
    !payrollForm.employee ||
    !payrollForm.month ||
    payrollForm.basicSalary === "" ||
    !Number.isFinite(basicSalary) ||
    !Number.isFinite(bonus) ||
    !Number.isFinite(deductions) ||
    basicSalary < 0 ||
    bonus < 0 ||
    deductions < 0 ||
    deductions > basicSalary + bonus
  ) {
    setPayrollError("Employee aur salary amounts check karo.");
    setSavingPayroll(false);
    return;
  }

  try {
    const response = await fetch(PAYROLL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payrollForm,
        basicSalary,
        bonus,
        deductions,
        netSalary,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payroll save nahi hua.");
    }

    setPayrollMessage("Payroll record successfully save ho gaya!");
    setPayrollForm(emptyPayrollForm);

    await loadPayroll(token);
  } catch (err) {
    setPayrollError(err.message || "Payroll save nahi hua.");
  } finally {
    setSavingPayroll(false);
  }
}

async function loadDepartments(currentToken = token) {
  if (!currentToken) return;
  setDepartmentLoading(true);
  setDepartmentError("");
  try {
    const response = await fetch(DEPARTMENT_API, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Departments load nahi huay.");
    setDepartments(Array.isArray(data) ? data : []);
  } catch (err) {
    setDepartmentError(err.message || "Departments load nahi huay.");
  } finally {
    setDepartmentLoading(false);
  }
}

async function handleSaveDepartment(event) {
  event.preventDefault();
  setDepartmentLoading(true);
  setDepartmentError("");
  setDepartmentMessage("");
  try {
    const response = await fetch(DEPARTMENT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: departmentName.trim(),
        description: departmentDescription.trim(),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Department save nahi hua.");
    setDepartmentName("");
    setDepartmentDescription("");
    setDepartmentMessage("Department successfully save ho gaya!");
    await loadDepartments(token);
  } catch (err) {
    setDepartmentError(err.message || "Department save nahi hua.");
  } finally {
    setDepartmentLoading(false);
  }
}

async function handleUpdatePayrollStatus(payrollId, status) {
  setUpdatingPayrollId(payrollId);
  setPayrollError("");
  setPayrollMessage("");

  try {
    const response = await fetch(
      `${PAYROLL_API}/${payrollId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment status update nahi hua.");
    }

    setPayrollMessage(`Payment status ${status} ho gaya.`);
    await loadPayroll(token);
  } catch (err) {
    setPayrollError(err.message || "Payment status update nahi hua.");
  } finally {
    setUpdatingPayrollId(null);
  }
}


  async function handleSaveAttendance(event) {
    event.preventDefault();
    setSavingAttendance(true);
    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const response = await fetch(ATTENDANCE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee: attendanceForm.employee,
          date: attendanceDate,
          status: attendanceForm.status,
          remarks: attendanceForm.remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Attendance save nahi hui.");
      }

      setAttendanceMessage(
        data.message || "Attendance successfully save ho gayi."
      );

      setAttendanceForm((previous) => ({
        ...previous,
        remarks: "",
      }));

      await loadAttendance(token, attendanceDate);
    } catch (err) {
      setAttendanceError(err.message || "Attendance save nahi hui.");
    } finally {
      setSavingAttendance(false);
    }
  }

  async function handleSaveLeave(event) {
    event.preventDefault();
    setSavingLeave(true);
    setLeaveError("");
    setLeaveMessage("");

    if (leaveForm.endDate < leaveForm.startDate) {
      setLeaveError("End date, start date se pehle nahi ho sakti.");
      setSavingLeave(false);
      return;
    }

    try {
      const response = await fetch(LEAVE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leaveForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Leave request submit nahi hui."
        );
      }

      setLeaveMessage(
        data.message || "Leave request submit ho gayi."
      );
      setLeaveForm(emptyLeaveForm);

      await loadLeaves(token);
    } catch (err) {
      setLeaveError(err.message || "Leave request submit nahi hui.");
    } finally {
      setSavingLeave(false);
    }
  }

  async function handleUpdateLeaveStatus(leaveId, status) {
    setUpdatingLeaveId(leaveId);
    setLeaveError("");
    setLeaveMessage("");

    try {
      const response = await fetch(`${LEAVE_API}/${leaveId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Leave status update nahi hua.");
      }

      setLeaveMessage(
        data.message || `Leave request ${status.toLowerCase()} ho gayi.`
      );

      await loadLeaves(token);
    } catch (err) {
      setLeaveError(err.message || "Leave status update nahi hua.");
    } finally {
      setUpdatingLeaveId(null);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditEmployee(employee) {
    setEditingEmployeeId(employee._id);

    setForm({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().slice(0, 10)
        : getToday(),
    });

    setShowForm(true);
    setEmployeeError("");
    setEmployeeMessage("");
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingEmployeeId(null);
    setForm(emptyForm);
    setEmployeeError("");
    setEmployeeMessage("");
  }

  async function handleSaveEmployee(event) {
    event.preventDefault();
    setSavingEmployee(true);
    setEmployeeError("");
    setEmployeeMessage("");

    try {
      const isEditing = Boolean(editingEmployeeId);

      const response = await fetch(
        isEditing
          ? `${EMPLOYEE_API}/${editingEmployeeId}`
          : EMPLOYEE_API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Employee update nahi ho saka."
              : "Employee add nahi ho saka.")
        );
      }

      setEmployeeMessage(
        data.message ||
          (isEditing
            ? "Employee update ho gaya!"
            : "Employee add ho gaya!")
      );

      setForm(emptyForm);
      setShowForm(false);
      setEditingEmployeeId(null);

      await loadEmployees(token);
    } catch (err) {
      setEmployeeError(err.message || "Request complete nahi hui.");
    } finally {
      setSavingEmployee(false);
    }
  }

  async function handleToggleEmployeeStatus(employee) {
    const newStatus =
      employee.status === "Active" ? "Inactive" : "Active";

    setEmployeeError("");
    setEmployeeMessage("");

    try {
      const response = await fetch(
        `${EMPLOYEE_API}/${employee._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update nahi hua.");
      }

      setEmployeeMessage(
        data.message || `Employee status ${newStatus} ho gaya.`
      );

      await loadEmployees(token);
    } catch (err) {
      setEmployeeError(err.message || "Status update nahi hua.");
    }
  }

  function handleLogout() {
    setUser(null);
    setToken("");
    setPassword("");
    setError("");
    setEmployeeError("");
    setEmployeeMessage("");
    setAttendanceError("");
    setAttendanceMessage("");
    setLeaveError("");
    setLeaveMessage("");
    setEmployees([]);
    setAttendanceRecords([]);
    setLeaveRecords([]);
    setActivePage("Dashboard");
    handleCancelForm();
  }

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase().trim();

    return [
      employee.employeeId,
      employee.name,
      employee.email,
      employee.department,
      employee.designation,
      employee.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const filteredLeaves = leaveRecords.filter((leave) => {
    const employee = leave.employee || {};
    const query = leaveSearch.toLowerCase().trim();

    const matchesSearch = [
      employee.name,
      employee.employeeId,
      employee.department,
      leave.reason,
      leave.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );

    const matchesStatus =
      leaveStatusFilter === "All" || leave.status === leaveStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-logo">H</div>
          <p className="login-eyebrow">HUMAN CAPITAL MANAGEMENT</p>
          <h1>Welcome back</h1>
          <p className="login-description">
            Sign in to your HCM Lite workspace.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-footer">
            HCM Lite · Workforce Management
          </p>
        </section>
      </main>
    );
  }

  const activeEmployees = employees.filter(
    (employee) => employee.status !== "Inactive"
  );

  const presentToday = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentToday = attendanceRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const lateToday = attendanceRecords.filter(
    (record) => record.status === "Late"
  ).length;

  const halfDayToday = attendanceRecords.filter(
    (record) => record.status === "Half Day"
  ).length;

  const attendanceRate =
    activeEmployees.length > 0
      ? Math.round((presentToday / activeEmployees.length) * 100)
      : 0;

  const pendingLeaves = leaveRecords.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const stats = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: "♙",
      note: "All employee records",
      tone: "stat-green",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: "✓",
      note: "Marked present",
      tone: "stat-mint",
    },
    {
      title: "Absent Today",
      value: absentToday,
      icon: "×",
      note: "Marked absent",
      tone: "stat-red",
    },
    {
      title: "Late Today",
      value: lateToday,
      icon: "◷",
      note: "Marked late",
      tone: "stat-amber",
    },
    {
      title: "Half Day",
      value: halfDayToday,
      icon: "½",
      note: "Marked half day",
      tone: "stat-blue",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: "%",
      note: `${activeEmployees.length} active employee(s)`,
      tone: "stat-purple",
    },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="login-logo">H</div>
          <div>
            <strong>HCM Lite</strong>
            <small>WORKFORCE SYSTEM</small>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="side-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "nav-active" : ""
              }`}
              onClick={() => {
                setActivePage(item.name);
                setEmployeeMessage("");
                setEmployeeError("");
                setAttendanceMessage("");
                setAttendanceError("");
                setLeaveMessage("");
                setLeaveError("");
              }}
            >
              <span>{item.icon}</span>
              {item.name}
              {item.name === "Leave Management" && pendingLeaves > 0 && (
                <span className="leave-nav-count">{pendingLeaves}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">
            {(user.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>

          <button
            className="logout-button"
            title="Log out"
            onClick={handleLogout}
          >
            ↪
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="login-eyebrow">HCM LITE / WORKSPACE</p>
            <h2>{activePage}</h2>
          </div>

          <div className="topbar-user">
            <span className="online-dot" />
            {user.name}
            <span className="role-chip">{user.role}</span>
          </div>
        </header>

        <section className="dashboard-content">
          {activePage === "Dashboard" && (
            <>
              <div className="welcome-banner">
                <div>
                  <p>ADMINISTRATOR WORKSPACE</p>
                  <h1>Welcome, {user.name}!</h1>
                  <span>
                    Manage your people and workplace from one place.
                  </span>
                </div>
                <div className="welcome-symbol">✳</div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Overview</h2>
                  <p>Live employee and attendance summary for today.</p>
                </div>
                <div className="dashboard-overview-actions">
                  <span className="date-chip">
                    {new Date().toLocaleDateString()}
                  </span>
                  <button
                    className="refresh-button"
                    type="button"
                    onClick={() => {
                      loadEmployees(token);
                      loadAttendance(token, getToday());
                      loadLeaves(token);
                    }}
                    disabled={employeesLoading || attendanceLoading}
                  >
                    {employeesLoading || attendanceLoading
                      ? "Loading..."
                      : "↻ Refresh"}
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                {stats.map((stat) => (
                  <article
                    className={`dashboard-stat ${stat.tone || ""}`}
                    key={stat.title}
                  >
                    <div className="stat-top">
                      <span>{stat.title}</span>
                      <span className="stat-icon">{stat.icon}</span>
                    </div>
                    <h3>{stat.value}</h3>
                    <p>{stat.note}</p>
                  </article>
                ))}
              </div>

        <section className="dashboard-panel departments-panel">
                <div>
                  <p className="login-eyebrow">GET STARTED</p>
                  <h2>Your HCM workspace</h2>
                  <p>
                    Review attendance, manage employee records and process
                    leave requests from one workspace.
                  </p>
                </div>

                <button
                  className="login-button panel-button"
                  onClick={() => {
                    setActivePage("Employees");
                    setEmployeeMessage("");
                  }}
                >
                  Open Employees →
                </button>
              </section>

              <section className="dashboard-panel leave-dashboard-panel">
                <div className="employee-heading">
                  <div>
                    <p className="login-eyebrow">LEAVE MANAGEMENT</p>
                    <h2>Leave requests overview</h2>
                    <p>Review requests that are waiting for a decision.</p>
                  </div>
                  <button
                    className="refresh-button"
                    onClick={() => {
                      setActivePage("Leave Management");
                    }}
                  >
                    Open Leave Management →
                  </button>
                </div>

                <div className="leave-summary-grid">
                  <article className="leave-summary-card">
                    <span>Pending</span>
                    <strong>{pendingLeaves}</strong>
                  </article>
                  <article className="leave-summary-card">
                    <span>Approved</span>
                    <strong>
                      {leaveRecords.filter(
                        (leave) => leave.status === "Approved"
                      ).length}
                    </strong>
                  </article>
                  <article className="leave-summary-card">
                    <span>Rejected</span>
                    <strong>
                      {leaveRecords.filter(
                        (leave) => leave.status === "Rejected"
                      ).length}
                    </strong>
                  </article>
                </div>
              </section>
            </>
          )}

          {activePage === "Employees" && (
            <section className="dashboard-panel employee-module">
              <div className="employee-heading">
                <div>
                  <p className="login-eyebrow">WORKFORCE DIRECTORY</p>
                  <h1>Employee Management</h1>
                  <p>
                    Add, edit and manage employee records stored in MongoDB.
                  </p>
                </div>

                <button
                  className="login-button panel-button"
                  onClick={() => {
                    if (showForm) {
                      handleCancelForm();
                    } else {
                      setEditingEmployeeId(null);
                      setForm(emptyForm);
                      setShowForm(true);
                      setEmployeeMessage("");
                      setEmployeeError("");
                    }
                  }}
                >
                  {showForm ? "Cancel" : "+ Add Employee"}
                </button>
              </div>

              {employeeMessage && (
                <p className="success-message" role="status">
                  {employeeMessage}
                </p>
              )}

              {employeeError && (
                <p className="login-error" role="alert">
                  {employeeError}
                </p>
              )}

              {showForm && (
                <form className="employee-form" onSubmit={handleSaveEmployee}>
                  <h2>
                    {editingEmployeeId
                      ? "Edit Employee Details"
                      : "New Employee Details"}
                  </h2>

                  <div className="employee-form-grid">
                    <div>
                      <label htmlFor="employeeId">Employee ID</label>
                      <input
                        id="employeeId"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleFormChange}
                        placeholder="EMP-001"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Employee full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="employeeEmail">Email Address</label>
                      <input
                        id="employeeEmail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="employee@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="department">Department</label>
                      <input
                        id="department"
                        name="department"
                        value={form.department}
                        onChange={handleFormChange}
                        placeholder="Engineering"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="designation">Designation</label>
                      <input
                        id="designation"
                        name="designation"
                        value={form.designation}
                        onChange={handleFormChange}
                        placeholder="Software Developer"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="joiningDate">Joining Date</label>
                      <input
                        id="joiningDate"
                        name="joiningDate"
                        type="date"
                        value={form.joiningDate}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    className="login-button"
                    type="submit"
                    disabled={savingEmployee}
                  >
                    {savingEmployee
                      ? "Saving..."
                      : editingEmployeeId
                        ? "Update Employee"
                        : "Save Employee"}
                  </button>

                  <button
                    className="refresh-button"
                    type="button"
                    onClick={handleCancelForm}
                    disabled={savingEmployee}
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="employee-list-heading">
                <div>
                  <h2>Employee Directory</h2>
                  <p>{employees.length} employee record(s)</p>
                </div>

                <button
                  className="refresh-button"
                  type="button"
                  onClick={() => loadEmployees(token)}
                  disabled={employeesLoading}
                >
                  {employeesLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <input
                className="employee-search"
                type="search"
                placeholder="Search by name, ID, email, department or status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {employeesLoading ? (
                <p className="employee-empty">Loading employees...</p>
              ) : filteredEmployees.length === 0 ? (
                <p className="employee-empty">
                  {employees.length === 0
                    ? "Abhi koi employee record nahi hai. Add Employee se pehla record banao."
                    : "Search se koi employee match nahi hua."}
                </p>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee._id}>
                          <td>{employee.employeeId}</td>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{employee.department}</td>
                          <td>{employee.designation}</td>
                          <td>
                            {employee.joiningDate
                              ? new Date(
                                  employee.joiningDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            <span className="role-chip">
                              {employee.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <div className="employee-actions">
                              <button
                                className="refresh-button"
                                type="button"
                                onClick={() => handleEditEmployee(employee)}
                              >
                                Edit
                              </button>
                              <button
                                className="refresh-button"
                                type="button"
                                onClick={() =>
                                  handleToggleEmployeeStatus(employee)
                                }
                              >
                                {employee.status === "Active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activePage === "Attendance" && (
            <section className="dashboard-panel attendance-module">
              <div className="employee-heading">
                <div>
                  <p className="login-eyebrow">WORKFORCE / DAILY RECORDS</p>
                  <h1>Attendance Management</h1>
                  <p>
                    Mark employee attendance and save the record to MongoDB.
                  </p>
                </div>

                <div className="attendance-date-control">
                  <label htmlFor="attendanceDate">Attendance date</label>
                  <input
                    id="attendanceDate"
                    type="date"
                    value={attendanceDate}
                    onChange={(event) =>
                      setAttendanceDate(event.target.value)
                    }
                  />
                </div>
              </div>

              {attendanceMessage && (
                <p className="success-message" role="status">
                  {attendanceMessage}
                </p>
              )}

              {attendanceError && (
                <p className="login-error" role="alert">
                  {attendanceError}
                </p>
              )}

              <form
                className="employee-form attendance-form"
                onSubmit={handleSaveAttendance}
              >
                <h2>Mark Attendance</h2>

                <div className="employee-form-grid">
                  <div>
                    <label htmlFor="attendanceEmployee">Employee</label>
                    <select
                      id="attendanceEmployee"
                      value={attendanceForm.employee}
                      onChange={(event) =>
                        setAttendanceForm((previous) => ({
                          ...previous,
                          employee: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select an employee</option>
                      {activeEmployees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.employeeId} — {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="attendanceStatus">Status</label>
                    <select
                      id="attendanceStatus"
                      value={attendanceForm.status}
                      onChange={(event) =>
                        setAttendanceForm((previous) => ({
                          ...previous,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Late</option>
                      <option>Half Day</option>
                    </select>
                  </div>

                  <div className="attendance-remarks-field">
                    <label htmlFor="attendanceRemarks">
                      Remarks (optional)
                    </label>
                    <input
                      id="attendanceRemarks"
                      value={attendanceForm.remarks}
                      onChange={(event) =>
                        setAttendanceForm((previous) => ({
                          ...previous,
                          remarks: event.target.value,
                        }))
                      }
                      placeholder="Add a note if needed"
                    />
                  </div>
                </div>

                <button
                  className="login-button"
                  type="submit"
                  disabled={savingAttendance || activeEmployees.length === 0}
                >
                  {savingAttendance ? "Saving..." : "Save Attendance"}
                </button>

                {activeEmployees.length === 0 && (
                  <p className="employee-empty">
                    Pehle Employees page par active employee add karein.
                  </p>
                )}
              </form>

              <div className="employee-list-heading">
                <div>
                  <h2>Daily Attendance</h2>
                  <p>
                    {attendanceRecords.length} record(s) for {attendanceDate}
                  </p>
                </div>
                <button
                  className="refresh-button"
                  type="button"
                  onClick={() => loadAttendance(token, attendanceDate)}
                  disabled={attendanceLoading}
                >
                  {attendanceLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              {attendanceLoading ? (
                <p className="employee-empty">Loading attendance...</p>
              ) : attendanceRecords.length === 0 ? (
                <p className="employee-empty">
                  Is date ke liye abhi attendance record nahi hai.
                </p>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record._id}>
                          <td>{record.employee?.employeeId || "—"}</td>
                          <td>
                            {record.employee?.name || "Employee unavailable"}
                          </td>
                          <td>{record.employee?.department || "—"}</td>
                          <td>
                            <span
                              className={`attendance-status status-${String(
                                record.status || ""
                              )
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td>{record.remarks || "—"}</td>
                          <td>
                            {record.createdAt
                              ? new Date(
                                  record.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activePage === "Leave Management" && (
            <section className="dashboard-panel leave-module">
              <div className="employee-heading">
                <div>
                  <p className="login-eyebrow">WORKFORCE / TIME OFF</p>
                  <h1>Leave Management</h1>
                  <p>
                    Submit leave requests and manage their approval status.
                  </p>
                </div>
                <button
                  className="refresh-button"
                  type="button"
                  onClick={() => loadLeaves(token)}
                  disabled={leaveLoading}
                >
                  {leaveLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <div className="leave-summary-grid">
                <article className="leave-summary-card">
                  <span>Total Requests</span>
                  <strong>{leaveRecords.length}</strong>
                </article>
                <article className="leave-summary-card">
                  <span>Pending</span>
                  <strong>{pendingLeaves}</strong>
                </article>
                <article className="leave-summary-card">
                  <span>Approved</span>
                  <strong>
                    {
                      leaveRecords.filter(
                        (leave) => leave.status === "Approved"
                      ).length
                    }
                  </strong>
                </article>
                <article className="leave-summary-card">
                  <span>Rejected</span>
                  <strong>
                    {
                      leaveRecords.filter(
                        (leave) => leave.status === "Rejected"
                      ).length
                    }
                  </strong>
                </article>
              </div>

              {leaveMessage && (
                <p className="success-message" role="status">
                  {leaveMessage}
                </p>
              )}
              {leaveError && (
                <p className="login-error" role="alert">
                  {leaveError}
                </p>
              )}

              <form className="employee-form" onSubmit={handleSaveLeave}>
                <h2>Submit Leave Request</h2>

                <div className="employee-form-grid">
                  <div>
                    <label htmlFor="leaveEmployee">Employee</label>
                    <select
                      id="leaveEmployee"
                      value={leaveForm.employee}
                      onChange={(event) =>
                        setLeaveForm((previous) => ({
                          ...previous,
                          employee: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select an employee</option>
                      {activeEmployees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.employeeId} — {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="leaveStartDate">Start Date</label>
                    <input
                      id="leaveStartDate"
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(event) =>
                        setLeaveForm((previous) => ({
                          ...previous,
                          startDate: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="leaveEndDate">End Date</label>
                    <input
                      id="leaveEndDate"
                      type="date"
                      min={leaveForm.startDate}
                      value={leaveForm.endDate}
                      onChange={(event) =>
                        setLeaveForm((previous) => ({
                          ...previous,
                          endDate: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="leaveReason">Reason</label>
                    <input
                      id="leaveReason"
                      value={leaveForm.reason}
                      onChange={(event) =>
                        setLeaveForm((previous) => ({
                          ...previous,
                          reason: event.target.value,
                        }))
                      }
                      placeholder="e.g. Personal work"
                      maxLength={500}
                      required
                    />
                  </div>
                </div>

                <button
                  className="login-button"
                  type="submit"
                  disabled={savingLeave || activeEmployees.length === 0}
                >
                  {savingLeave ? "Submitting..." : "Submit Leave Request"}
                </button>

                {activeEmployees.length === 0 && (
                  <p className="employee-empty">
                    Leave request se pehle ek active employee add karein.
                  </p>
                )}
              </form>

              <div className="employee-list-heading">
                <div>
                  <h2>Leave Requests</h2>
                  <p>{filteredLeaves.length} request(s) shown</p>
                </div>
              </div>

              <div className="leave-filters">
                <input
                  className="employee-search"
                  type="search"
                  placeholder="Search employee, department or reason..."
                  value={leaveSearch}
                  onChange={(event) => setLeaveSearch(event.target.value)}
                />

                <select
                  aria-label="Filter leave status"
                  value={leaveStatusFilter}
                  onChange={(event) =>
                    setLeaveStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {leaveLoading ? (
                <p className="employee-empty">Loading leave requests...</p>
              ) : filteredLeaves.length === 0 ? (
                <p className="employee-empty">
                  Koi leave request nahi mili. Form se pehli request submit
                  karein ya search filter change karein.
                </p>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.map((leave) => {
                        const employee = leave.employee || {};

                        return (
                          <tr key={leave._id}>
                            <td>
                              <strong>{employee.name || "Unknown"}</strong>
                              <br />
                              <small>{employee.employeeId || "—"}</small>
                            </td>
                            <td>{employee.department || "—"}</td>
                            <td>
                              {leave.startDate
                                ? new Date(
                                    leave.startDate
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>
                              {leave.endDate
                                ? new Date(
                                    leave.endDate
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>{leave.reason || "—"}</td>
                            <td>
                              <span
                                className={`attendance-status status-${String(
                                  leave.status || "Pending"
                                ).toLowerCase()}`}
                              >
                                {leave.status || "Pending"}
                              </span>
                            </td>
                            <td>
                              {leave.status === "Pending" ? (
                                <div className="employee-actions">
                                  <button
                                    className="refresh-button"
                                    type="button"
                                    disabled={updatingLeaveId === leave._id}
                                    onClick={() =>
                                      handleUpdateLeaveStatus(
                                        leave._id,
                                        "Approved"
                                      )
                                    }
                                  >
                                    {updatingLeaveId === leave._id
                                      ? "Updating..."
                                      : "Approve"}
                                  </button>
                                  <button
                                    className="refresh-button"
                                    type="button"
                                    disabled={updatingLeaveId === leave._id}
                                    onClick={() =>
                                      handleUpdateLeaveStatus(
                                        leave._id,
                                        "Rejected"
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="employee-empty">
                                  Reviewed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

         

    
          {activePage === "Payroll" && (
            <section className="dashboard-panel leave-module">
              <div className="employee-heading">
                <div>
                  <p className="login-eyebrow">WORKFORCE / COMPENSATION</p>
                  <h1>Payroll Management</h1>
                  <p>Manage employee salaries and payment status.</p>
                </div>

                <button
                  className="refresh-button"
                  type="button"
                  onClick={() => loadPayroll(token)}
                  disabled={payrollLoading}
                >
                  {payrollLoading ? "Loading..." : "↻ Refresh"}
                </button>
              </div>

              <div className="leave-summary-grid">
                <article className="leave-summary-card">
                  <span>Total Payroll Records</span>
                  <strong>{payrollRecords.length}</strong>
                </article>
                <article className="leave-summary-card">
                  <span>Pending Payments</span>
                  <strong>
                    {payrollRecords.filter((p) => p.status !== "Paid").length}
                  </strong>
                </article>
                <article className="leave-summary-card">
                  <span>Paid Records</span>
                  <strong>
                    {payrollRecords.filter((p) => p.status === "Paid").length}
                  </strong>
                </article>
                <article className="leave-summary-card">
                  <span>Total Net Payroll</span>
                  <strong>
                    {payrollRecords
                      .reduce((sum, p) => sum + Number(p.netSalary || 0), 0)
                      .toLocaleString()}
                  </strong>
                </article>
              </div>

              {payrollMessage && (
                <p className="success-message" role="status">
                  {payrollMessage}
                </p>
              )}
              {payrollError && (
                <p className="login-error" role="alert">
                  {payrollError}
                </p>
              )}

              <form className="employee-form" onSubmit={handleSavePayroll}>
                <h2>Create Payroll Record</h2>

                <div className="employee-form-grid">
                  <div>
                    <label htmlFor="payEmployee">Employee</label>
                    <select
                      id="payEmployee"
                      value={payrollForm.employee}
                      onChange={(e) =>
                        setPayrollForm((p) => ({
                          ...p,
                          employee: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select employee</option>
                      {activeEmployees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.employeeId} — {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="payMonth">Salary Month</label>
                    <input
                      id="payMonth"
                      type="month"
                      value={payrollForm.month}
                      onChange={(e) =>
                        setPayrollForm((p) => ({
                          ...p,
                          month: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="basicSalary">Basic Salary</label>
                    <input
                      id="basicSalary"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.basicSalary}
                      onChange={(e) =>
                        setPayrollForm((p) => ({
                          ...p,
                          basicSalary: e.target.value,
                        }))
                      }
                      placeholder="e.g. 50000"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="bonus">Bonus</label>
                    <input
                      id="bonus"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.bonus}
                      onChange={(e) =>
                        setPayrollForm((p) => ({
                          ...p,
                          bonus: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="deductions">Deductions</label>
                    <input
                      id="deductions"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.deductions}
                      onChange={(e) =>
                        setPayrollForm((p) => ({
                          ...p,
                          deductions: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="dashboard-panel">
                  <span>Calculated Net Salary</span>
                  <h2>
                    {(
                      (Number(payrollForm.basicSalary) || 0) +
                      (Number(payrollForm.bonus) || 0) -
                      (Number(payrollForm.deductions) || 0)
                    ).toLocaleString()}
                  </h2>
                  <small>Basic salary + bonus − deductions</small>
                </div>

                <button
                  className="login-button"
                  type="submit"
                  disabled={savingPayroll || activeEmployees.length === 0}
                >
                  {savingPayroll ? "Saving..." : "Save Payroll"}
                </button>

                {activeEmployees.length === 0 && (
                  <p className="employee-empty">
                    Payroll banane se pehle ek active employee add karo.
                  </p>
                )}
              </form>

              <div className="employee-list-heading">
                <div>
                  <h2>Payroll History</h2>
                  <p>{payrollRecords.length} record(s)</p>
                </div>
              </div>

              {payrollLoading ? (
                <p className="employee-empty">Loading payroll...</p>
              ) : payrollRecords.length === 0 ? (
                <p className="employee-empty">
                  Abhi payroll record nahi hai. Upar form se pehla record banao.
                </p>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Month</th>
                        <th>Basic Salary</th>
                        <th>Bonus</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollRecords.map((record) => (
                        <tr key={record._id}>
                          <td>
                            {record.employee?.name || "Unknown"}
                            <br />
                            <small>
                              {record.employee?.employeeId || "—"}
                            </small>
                          </td>
                          <td>{record.month}</td>
                          <td>
                            {Number(record.basicSalary || 0).toLocaleString()}
                          </td>
                          <td>
                            {Number(record.bonus || 0).toLocaleString()}
                          </td>
                          <td>
                            {Number(record.deductions || 0).toLocaleString()}
                          </td>
                          <td>
                            <strong>
                              {Number(record.netSalary || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <span
                              className={`attendance-status status-${String(
                                record.status || "Pending"
                              ).toLowerCase()}`}
                            >
                              {record.status || "Pending"}
                            </span>
                          </td>
                          <td>
                            {record.status !== "Paid" ? (
                              <button
                                className="refresh-button"
                                type="button"
                                disabled={updatingPayrollId === record._id}
                                onClick={() =>
                                  handleUpdatePayrollStatus(
                                    record._id,
                                    "Paid"
                                  )
                                }
                              >
                                {updatingPayrollId === record._id
                                  ? "Updating..."
                                  : "Mark Paid"}
                              </button>
                            ) : (
                              <span className="employee-empty">Paid ✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

         

{activePage === "Departments" && (
  <section className="dashboard-panel departments-page">
    <div className="departments-header">
      <div>
        <p className="login-eyebrow">HCM LITE / WORKSPACE</p>
        <h1>Departments</h1>
        <p>Organize your teams and manage company departments.</p>
      </div>
      <div className="departments-count">
        <span>Total Departments</span>
        <strong>{departments.length}</strong>
      </div>
    </div>

    <div className="departments-layout">
      <div className="departments-form-card">
        <h2>Add New Department</h2>
        <p className="departments-help">
          Enter the department details below.
        </p>

        <form onSubmit={handleSaveDepartment}>
          <div className="form-group">
            <label htmlFor="departmentName">Department Name</label>
            <input
              id="departmentName"
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. IT Department"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="departmentDescription">Description</label>
            <input
              id="departmentDescription"
              type="text"
              value={departmentDescription}
              onChange={(e) => setDepartmentDescription(e.target.value)}
              placeholder="What does this department do?"
            />
          </div>

          <button
            type="submit"
            className="login-button panel-button departments-submit"
            disabled={departmentLoading}
          >
            {departmentLoading ? "Please wait..." : "+ Add Department"}
          </button>
        </form>

        {departmentMessage && (
          <p className="departments-message">{departmentMessage}</p>
        )}
        {departmentError && (
          <p className="departments-error">{departmentError}</p>
        )}
      </div>

      <div className="departments-list-card">
        <div className="departments-list-header">
          <div>
            <h2>Department List</h2>
            <p className="departments-help">
              Your company's departments
            </p>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => loadDepartments()}
            disabled={departmentLoading}
          >
            {departmentLoading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {departmentLoading ? (
          <p className="departments-empty">Loading departments...</p>
        ) : departments.length === 0 ? (
          <div className="departments-empty">
            <span className="departments-empty-icon">▤</span>
            <h3>No departments yet</h3>
            <p>Add your first department using the form.</p>
          </div>
        ) : (
          <div className="departments-list">
            {departments.map((department) => (
              <div key={department._id} className="department-item">
                <div className="department-icon">
                  {(department.name || "D").charAt(0).toUpperCase()}
                </div>
                <div className="department-item-info">
                  <h3>{department.name}</h3>
                  <p>{department.description || "No description added"}</p>
                </div>
                <span className="department-status">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)}

        </section>
      </main>
    </div>
  );
}

export default App;
