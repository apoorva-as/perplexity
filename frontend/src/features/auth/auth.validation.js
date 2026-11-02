/* Client-side checks that mirror backend/src/validators/auth.validator.js */

export const validateLogin = ({ username, password }) => {
  const errors = {};
  if (!username.trim()) errors.username = "Username is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

export const validateRegister = ({ username, password, confirmPassword }) => {
  const errors = {};
  const name = username.trim();

  if (!name) errors.username = "Username is required";
  else if (name.length < 3 || name.length > 30) errors.username = "Username must be between 3 and 30 characters";
  else if (!/^[a-zA-Z0-9_]+$/.test(name)) errors.username = "Only letters, numbers, and underscores are allowed";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";

  // Client-only check; the API receives just username and password.
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

  return errors;
};
