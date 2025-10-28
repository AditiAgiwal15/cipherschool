import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Check theme preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('cipherStudioTheme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  React.useEffect(() => {
    localStorage.setItem('cipherStudioTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
    // For now, just navigate back to home
    navigate("/");
  };

  return (
    <div className={darkMode ? "app-container dark" : "app-container light"}>
      <header className="header">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            CipherStudio
          </h1>
        </div>
        <div className="header-right">
          <span className="theme-label">ChangeTheme</span>
          <div className="toggle-container">
            <div 
              className={`toggle-switch ${darkMode ? 'dark-mode' : 'light-mode'}`}
              onClick={toggleTheme}
            >
              <div className="toggle-handle">
                {darkMode && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
                {!darkMode && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your CipherStudio account</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="login-submit-btn">
              Sign In
            </button>

            <div className="login-footer">
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
          </form>

          <div className="login-signup">
            <p>Don't have an account? <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

