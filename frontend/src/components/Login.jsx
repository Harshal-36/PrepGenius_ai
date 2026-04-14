import React, { useState } from "react";
import axios from "axios";

function Login({ setToken, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!username || !password) return alert("Please enter credentials");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);
      setToken(res.data.access);
    } catch {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Welcome Back</h2>
      <div className="input-group">
        <input 
          type="text"
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          autoComplete="username"
        />
      </div>
      <div className="input-group">
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          autoComplete="current-password"
        />
      </div>
      <button className="btn btn-primary" onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Don't have an account?{" "}
        <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={switchToRegister}>
          Sign up
        </span>
      </p>
    </div>
  );
}

export default Login;