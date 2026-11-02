import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { AlertIcon, LockIcon, ShieldIcon, UserIcon } from "../../../shared/components/Icons";
import Splash from "../../../shared/components/Splash";
import { validateRegister } from "../auth.validation";
import AuthField from "../components/AuthField";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hook/useAuth";

const Register = () => {
  const [values, setValues] = useState({ username: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { handleRegister, clearError } = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  // Don't carry an error over from another auth page.
  useEffect(() => {
    clearError();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validateField = (field, nextValues) => {
    const fieldError = validateRegister(nextValues)[field];
    setErrors((current) => ({ ...current, [field]: fieldError }));
  };

  const updateField = (field) => (event) => {
    const nextValues = { ...values, [field]: event.target.value };
    setValues(nextValues);
    // Re-check live only once a field has shown an error.
    if (errors[field]) validateField(field, nextValues);
    if (field === "password" && errors.confirmPassword) validateField("confirmPassword", nextValues);
  };

  const blurField = (field) => () => {
    if (values[field]) validateField(field, values);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    // The API only takes username + password; confirmPassword stays client-side.
    const success = await handleRegister({ username: values.username.trim(), password: values.password });
    setSubmitting(false);
    if (success) navigate("/", { replace: true });
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  // Initial session check (not our own submit): avoid flashing the form for signed-in users.
  if (loading && !submitting) {
    return <Splash label="Checking your session..." />;
  }

  return (
    <AuthLayout
      headline="Answers from across the web, saved in one place."
      description="Search with AI, follow up naturally, and pick up any conversation right where you left off."
    >
      <h2>Start your search journey</h2>
      <p className="auth-card-subtitle">Create an account to explore, search, and save your conversations.</p>

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
          value={values.username}
          onChange={updateField("username")}
          onBlur={blurField("username")}
          placeholder="Choose a username"
          autoComplete="username"
          autoFocus
          error={errors.username}
          hint="3–30 characters: letters, numbers, and underscores."
          required
        />

        <AuthField
          id="password"
          label="Password"
          icon={LockIcon}
          type="password"
          value={values.password}
          onChange={updateField("password")}
          onBlur={blurField("password")}
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password}
          hint="At least 6 characters."
          required
        />

        <AuthField
          id="confirmPassword"
          label="Confirm password"
          icon={ShieldIcon}
          type="password"
          value={values.confirmPassword}
          onChange={updateField("confirmPassword")}
          onBlur={blurField("confirmPassword")}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        <button type="submit" className="btn btn-primary btn-lg btn-block auth-submit" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
