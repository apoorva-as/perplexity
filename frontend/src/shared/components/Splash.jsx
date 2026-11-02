import { BrandMark } from "./Icons";

/* Full-screen loading state used while the session is being checked. */
const Splash = ({ label = "Loading your workspace..." }) => (
  <div className="splash" role="status" aria-live="polite">
    <BrandMark size={36} strokeWidth={1.5} />
    <span>{label}</span>
  </div>
);

export default Splash;
