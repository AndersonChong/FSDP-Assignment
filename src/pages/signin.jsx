import React from "react";
import "../styles/signin.css";

export default function SignIn() {
  return (
    <div className="app">
      <div className="left-panel">
        <div className="left-top">
          <span className="dot" />
          <span className="brand">Flying Bot</span>
        </div>
        <div className="left-bottom">
          Welcome to Flying Bot. Sign in to experience our AI-powered
          conversational tools.
        </div>
        <div className="lines lines-1" />
        <div className="lines lines-2" />
        <div className="lines lines-3" />
      </div>

      <div className="right-panel">
        <div className="card">
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Sign in to continue to your account</p>

          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="user@example.com"
            className="input"
          />

          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Password" className="input" />

          <button className="primary-btn">Sign in</button>

          <div className="divider">OR CONTINUE WITH</div>

          <button className="social-btn">
            <span className="icon">G</span>
            Google
          </button>
          <button className="social-btn">
            <span className="icon">🐙</span>
            GitHub
          </button>

          <p className="footer-text">
            Don&apos;t have an account? <a href="#signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
