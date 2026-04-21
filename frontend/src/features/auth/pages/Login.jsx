import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();

    const success = await handleLogin({ username, password });
    if (success) navigate("/");
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="auth-screen">
      <div className="auth-shell">
        <div className="auth-panel brand">
          <div className="auth-logo">
            <span className="auth-logo-mark">
              <BrandIcon />
            </span>
            <span>Perplexity</span>
          </div>

          <div className="auth-copy">
            <h1>Search, chat, and explore in one focused workspace.</h1>
            <p>
              Sign in to access your recent conversations, ask follow-up questions, and keep the dashboard layout
              exactly like the product experience you want.
            </p>
          </div>

          <div className="auth-highlights">
            <span>Real-time search flow</span>
            <span>Recent chats sidebar</span>
            <span>Perplexity-style UI</span>
          </div>
        </div>

        <div className="auth-panel form">
          <div className="auth-form-shell">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h2>Login to continue</h2>
            <p>Use your account to open the dashboard and continue your saved chats.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={submitForm} className="auth-form">
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="auth-submit">
                Login
              </button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 3.75 12 8.5l1.5-4.75L15 8.5l4.75-1.5L15 10.5l4.75 1.5L15 13.5l-1.5 4.75L12 13.5l-1.5 4.75L9 13.5 4.25 15 9 12 4.25 10.5 9 8.5l1.5-4.75Z" />
  </svg>
);

export default Login;
