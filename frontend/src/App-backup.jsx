
import { useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000/api/auth";

function App() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

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

      setUser(data.user);
    } catch (err) {
      setError(err.message || "Backend se connection nahi hua.");
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-logo">H</div>
          <p className="login-eyebrow">HUMAN CAPITAL MANAGEMENT</p>
          <h1>Welcome, {user.name}!</h1>
          <p className="login-description">
            You are logged in as <strong>{user.role}</strong>.
          </p>
          <p>HCM Lite dashboard hum aglay step mein banayenge.</p>
          <button
            className="login-button"
            onClick={() => {
              setUser(null);
              setPassword("");
            }}
          >
            Log out
          </button>
        </section>
      </main>
    );
  }

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
            placeholder="Enter your email"
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          HCM Lite · Secure workforce management
        </p>
      </section>
    </main>
  );
}

export default App;
