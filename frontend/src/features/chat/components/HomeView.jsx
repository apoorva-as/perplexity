import {
  ArrowUpRightIcon,
  BrandMark,
  CpuIcon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
  TrendingIcon,
} from "../../../shared/components/Icons";
import Composer from "./Composer";

const CATEGORY_ICONS = {
  "Trending Tech": TrendingIcon,
  Startups: RocketIcon,
  "AI Tools": SparklesIcon,
  Gadgets: CpuIcon,
};

const HomeView = ({
  categories,
  suggestions,
  input,
  onInputChange,
  onSubmit,
  isBusy,
  onPrefill,
  onAttach,
  onMic,
  composerRef,
}) => (
  <div className="home scroll-area">
    <div className="home-inner view-enter">
      <header className="home-hero">
        <span className="home-badge">
          <span className="home-badge-dot" aria-hidden="true" />
          Live web search enabled
        </span>
        <h1 className="home-wordmark">
          <BrandMark strokeWidth={1.5} />
          Perplexity
        </h1>
        <p className="home-tagline">Ask anything. Get clear, sourced answers from across the web in seconds.</p>
      </header>

      <Composer
        ref={composerRef}
        variant="hero"
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={isBusy}
        placeholder="Ask anything..."
        onAttach={onAttach}
        onMic={onMic}
        autoFocus
      />

      <div className="home-chips" role="group" aria-label="Topics">
        {categories.map((category) => {
          const CategoryIcon = CATEGORY_ICONS[category] || SearchIcon;
          return (
            <button
              key={category}
              type="button"
              className="chip"
              aria-pressed={input.trim() === category}
              onClick={() => onPrefill(category)}
            >
              <CategoryIcon size={14} />
              {category}
            </button>
          );
        })}
      </div>

      <section className="home-suggestions" aria-labelledby="suggestions-heading">
        <h2 id="suggestions-heading" className="home-suggestions-label">
          Try asking
        </h2>
        <ul className="suggestion-list">
          {suggestions.map((prompt) => (
            <li key={prompt}>
              <button type="button" className="suggestion" onClick={() => onPrefill(prompt)}>
                <span className="suggestion-icon" aria-hidden="true">
                  <SearchIcon size={14} />
                </span>
                <span className="suggestion-text">{prompt}</span>
                <ArrowUpRightIcon size={15} className="suggestion-arrow" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </div>
);

export default HomeView;
