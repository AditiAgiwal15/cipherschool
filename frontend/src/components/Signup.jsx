import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter your name.");
    if (!email.trim()) return alert("Please enter your email.");
    if (password.length < 6) return alert("Password must be at least 6 characters.");
    if (password !== confirm) return alert("Passwords do not match.");

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      alert("Account created successfully! You can now sign in.");
      navigate("/login");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container dark">
      <header className="header">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            CipherStudio
          </h1>
        </div>
        <div className="header-right">
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        </div>
      </header>

      <div className="login-container">
        <div className="login-card" style={{ maxWidth: 480 }}>
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Join CipherStudio in seconds</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                className="form-input"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button className="login-submit-btn" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="login-signup">
            <p>Already have an account? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}



