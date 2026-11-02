import { Link } from "react-router";
import { BrandMark, GlobeIcon, HistoryIcon, MoonIcon, ShieldIcon, SunIcon, ZapIcon } from "../../../shared/components/Icons";
import { useTheme } from "../../../shared/hooks/useTheme";

const FEATURES = [
  { icon: GlobeIcon, title: "Live web answers", text: "Every answer is grounded in fresh search results." },
  { icon: HistoryIcon, title: "Saved conversations", text: "Pick up any thread right where you left off." },
  { icon: ZapIcon, title: "Fast follow-ups", text: "Dig deeper with natural follow-up questions." },
];

const AuthLayout = ({ headline, description, children }) => {
  const { isLight, toggleTheme } = useTheme();

  return (
    <div className="auth">
      <aside className="auth-brand">
        <Link to="/" className="auth-logo">
          <BrandMark size={24} />
          Perplexity
        </Link>

        <div className="auth-headline">
          <h1>{headline}</h1>
          <p>{description}</p>

          <ul className="auth-features">
            {FEATURES.map(({ icon, title, text }) => {
              const FeatureIcon = icon;
              return (
              <li key={title} className="auth-feature">
                <span className="auth-feature-icon" aria-hidden="true">
                  <FeatureIcon size={16} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </span>
              </li>
              );
            })}
          </ul>
        </div>

        <p className="auth-brand-footer">
          <ShieldIcon size={14} />
          Your session is secured with HTTP-only cookies.
        </p>
      </aside>

      <main className="auth-form-panel">
        <button
          type="button"
          className="icon-btn bordered auth-theme-toggle"
          onClick={toggleTheme}
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          title={isLight ? "Dark mode" : "Light mode"}
        >
          {isLight ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </button>

        <div className="auth-card">
          <Link to="/" className="auth-logo auth-mobile-logo">
            <BrandMark size={22} />
            Perplexity
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
