import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  const submitForm = async (event) => {
    event.preventDefault();
    const success = await handleRegister({ username, password });
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
            <h1>Create your account and land directly in the new dashboard.</h1>
            <p>
              Register once, then the app opens into the exact black dashboard flow with search, recent chats, and
              the result layout from your reference images.
            </p>
          </div>

          <div className="auth-highlights">
            <span>Register in seconds</span>
            <span>Recent chat history</span>
            <span>Follow-up search view</span>
          </div>
        </div>

        <div className="auth-panel form">
          <div className="auth-form-shell">
            <p className="auth-eyebrow">CREATE ACCOUNT</p>
            <h2>Start using the dashboard</h2>
            <p>Pick a username and password to begin searching and saving chats.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={submitForm} className="auth-form">
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a username"
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
                  placeholder="Create a password"
                  required
                />
              </div>

              <button type="submit" className="auth-submit">
                Register
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
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

export default Register;
