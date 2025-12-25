import { useState } from "react";
import api from "../services/api";
import "../components/styles/Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!username || !password) {
      setError("Please enter both ID and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { username, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      const stateRes = await api.get("/dashboard-state");
      onLogin(stateRes.data);
    } catch (err) {
      setError("Invalid ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">Admin Login</h1>
        <p className="subtitle">Secure Dashboard Access</p>

        <div className="field">
          <label>ID</label>
          <input
            type="text"
            placeholder="Enter admin ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button
          className="login-btn"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="footer">
          <button
            className="link-btn"
            onClick={() => alert("Contact system administrator")}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
