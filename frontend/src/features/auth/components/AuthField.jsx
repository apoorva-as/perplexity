import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "../../../shared/components/Icons";

/**
 * Labeled input with a leading icon, optional password visibility toggle,
 * and a hint or validation message underneath.
 */
const AuthField = ({ id, label, icon: FieldIcon, type = "text", error, hint, ...inputProps }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const message = error || hint;
  const messageId = message ? `${id}-message` : undefined;

  return (
    <div className={`field ${error ? "invalid" : ""}`}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-control">
        {FieldIcon && <FieldIcon size={16} className="field-icon" />}
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          className={`field-input ${isPassword ? "has-action" : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="icon-btn sm field-action"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        )}
      </div>
      {message && (
        <p id={messageId} className="field-message" role={error ? "alert" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthField;
