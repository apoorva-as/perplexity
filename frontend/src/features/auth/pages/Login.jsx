import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { AlertIcon, LockIcon, UserIcon } from "../../../shared/components/Icons";
import Splash from "../../../shared/components/Splash";
import { validateLogin } from "../auth.validation";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hook/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  const { handleLogin, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  // Don't carry an error over from another auth page.
  useEffect(() => {
    clearError();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFieldError = (field) => {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    const nextErrors = validateLogin({ username, password });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    const success = await handleLogin({ username: username.trim(), password });
    setSubmitting(false);
    if (success) navigate(redirectTo, { replace: true });
  };

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Initial session check (not our own submit): avoid flashing the form for signed-in users.
  if (loading && !submitting) {
    return <Splash label="Checking your session..." />;
  }

  return (
    <AuthLayout
      headline="Search, chat, and explore in one focused workspace."
      description="Ask anything and get clear, sourced answers from across the web, with every conversation saved."
    >
      <h2>Welcome back</h2>
      <p className="auth-card-subtitle">Continue exploring the web with AI-powered search.</p>

      {error && (
        <div className="alert" role="alert">
          <AlertIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submitForm} className="auth-form" noValidate>
        <AuthField
          id="username"
          label="Username"
          icon={UserIcon}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            clearFieldError("username");
          }}
          placeholder="Enter your username"
          autoComplete="username"
          autoFocus
          error={errors.username}
          required
        />

        <AuthField
          id="password"
          label="Password"
          icon={LockIcon}
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Create account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
