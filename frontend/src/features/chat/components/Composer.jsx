import { forwardRef, useLayoutEffect, useRef } from "react";
import { ArrowUpIcon, MicIcon, PaperclipIcon } from "../../../shared/components/Icons";

const MAX_HEIGHT = 220;

/**
 * Search / message input. `variant="hero"` is the large landing composer,
 * `variant="dock"` the follow-up composer pinned under a conversation.
 * Enter submits, Shift+Enter inserts a new line.
 */
const Composer = forwardRef(function Composer(
  { value, onChange, onSubmit, disabled, placeholder = "Ask anything...", variant = "dock", onAttach, onMic, autoFocus },
  forwardedRef
) {
  const localRef = useRef(null);

  const setRefs = (node) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  // Grow with content up to MAX_HEIGHT, then scroll.
  useLayoutEffect(() => {
    const textarea = localRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSubmit = Boolean(value.trim()) && !disabled;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSubmit) event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className={`composer ${variant}`}>
      <label htmlFor={`composer-${variant}`} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={`composer-${variant}`}
        ref={setRefs}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="composer-input scroll-area"
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck
      />

      <div className="composer-toolbar">
        <div className="composer-tools">
          <button type="button" className="icon-btn" onClick={onAttach} aria-label="Attach" title="Attach">
            <PaperclipIcon size={17} />
          </button>
          <button type="button" className="icon-btn" onClick={onMic} aria-label="Voice input" title="Voice input">
            <MicIcon size={17} />
          </button>
        </div>

        <div className="composer-tools">
          <span className="composer-hint" aria-hidden="true">
            <kbd>Shift</kbd> + <kbd>Enter</kbd> new line
          </span>
          <button
            type="submit"
            className="composer-submit"
            disabled={!canSubmit}
            aria-label={disabled ? "Waiting for response" : "Submit"}
            title="Submit"
          >
            {disabled && value.trim() ? <span className="spinner" /> : <ArrowUpIcon size={17} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </form>
  );
});

export default Composer;
