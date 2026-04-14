import React, { useState } from "react";
import axios from "axios";

function Register({ switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!username || !email || !password || !confirmPassword) return alert("Please fill all fields");
    if (password !== confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        email,
        password,
      });
      alert("Registration successful! Please log in.");
      switchToLogin();
    } catch {
      alert("Registration failed. Try a different username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Create Account</h2>
      <div className="input-group">
        <input 
          type="text"
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
        />
      </div>
      <div className="input-group">
        <input 
          type="email"
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="input-group">
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <div className="input-group">
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
      </div>
      <button className="btn btn-primary" onClick={register} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already have an account?{" "}
        <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={switchToLogin}>
          Log in
        </span>
      </p>
    </div>
  );
}

export default Register;