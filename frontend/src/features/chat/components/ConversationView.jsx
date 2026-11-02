import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownIcon, BrandMark, CheckIcon, CopyIcon, GlobeIcon, LayersIcon } from "../../../shared/components/Icons";
import { useCopyToClipboard } from "../../../shared/hooks/useCopyToClipboard";
import { extractSources, groupMessagesIntoTurns } from "../utils/chat.utils";
import Composer from "./Composer";
import MarkdownAnswer from "./MarkdownAnswer";

const SourceList = ({ sources }) => (
  <section className="turn-sources" aria-label="Sources">
    <h3 className="turn-section-label">
      <LayersIcon size={15} />
      Sources
    </h3>
    <ol className="sources-grid">
      {sources.map((source, index) => (
        <li key={source.url}>
          <a className="source-card" href={source.url} target="_blank" rel="noopener noreferrer" title={source.url}>
            <span className="source-title">{source.title}</span>
            <span className="source-meta">
              <span className="source-favicon" aria-hidden="true">
                {source.domain.slice(0, 1)}
              </span>
              <span className="source-domain">{source.domain}</span>
              <span className="source-index">{index + 1}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  </section>
);

const ThinkingIndicator = ({ label = "Searching the web" }) => (
  <div className="thinking" role="status" aria-live="polite">
    <span className="thinking-status">
      <GlobeIcon size={15} />
      <span className="thinking-shimmer">{label}</span>
      <span className="thinking-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
    <div className="thinking-lines" aria-hidden="true">
      <span className="skeleton" style={{ width: "92%", height: 12 }} />
      <span className="skeleton" style={{ width: "84%", height: 12 }} />
      <span className="skeleton" style={{ width: "66%", height: 12 }} />
    </div>
  </div>
);

const Turn = ({ query, answer, pending }) => {
  const { copied, copy } = useCopyToClipboard();
  const text = typeof answer === "string" ? answer : String(answer ?? "");
  const sources = useMemo(() => (text ? extractSources(text) : []), [text]);

  return (
    <article className="turn">
      {query && <h2 className="turn-query">{query}</h2>}

      {sources.length > 0 && <SourceList sources={sources} />}

      {pending ? (
        <ThinkingIndicator />
      ) : (
        text && (
          <section aria-label="Answer">
            <h3 className="turn-section-label">
              <BrandMark size={15} />
              Answer
            </h3>
            <MarkdownAnswer content={text} />
            <div className="turn-actions">
              <button type="button" className="btn btn-ghost" onClick={() => copy(text)}>
                {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        )
      )}
    </article>
  );
};

const ConversationSkeleton = () => (
  <div className="turn" aria-label="Loading conversation" role="status">
    <span className="skeleton" style={{ width: "55%", height: 24, marginBottom: 28 }} />
    <div className="thinking-lines">
      <span className="skeleton" style={{ width: "96%", height: 12 }} />
      <span className="skeleton" style={{ width: "90%", height: 12 }} />
      <span className="skeleton" style={{ width: "94%", height: 12 }} />
      <span className="skeleton" style={{ width: "60%", height: 12 }} />
    </div>
  </div>
);

const ConversationView = ({
  messages,
  pendingMessage,
  isOpening,
  input,
  onInputChange,
  onSubmit,
  isBusy,
  onAttach,
  onMic,
  composerRef,
  onScrolledChange,
}) => {
  const scrollRef = useRef(null);
  const [showJump, setShowJump] = useState(false);
  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Follow new messages and the pending indicator.
  useEffect(() => {
    scrollToBottom(messages.length && !pendingMessage ? "auto" : "smooth");
  }, [messages.length, pendingMessage, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(distance > 240);
    onScrolledChange?.(el.scrollTop > 4);
  };

  return (
    <>
      <div ref={scrollRef} className="thread-scroll scroll-area" onScroll={handleScroll}>
        <div className="thread">
          {isOpening && !turns.length ? (
            <ConversationSkeleton />
          ) : (
            turns.map((turn, index) => <Turn key={index} query={turn.query} answer={turn.answer} />)
          )}
          {pendingMessage && <Turn query={pendingMessage} pending />}
        </div>
      </div>

      <div className="dock">
        <div className="dock-inner">
          {showJump && (
            <button
              type="button"
              className="btn btn-secondary jump-latest"
              onClick={() => scrollToBottom()}
              aria-label="Jump to latest"
            >
              <ArrowDownIcon size={14} />
              Latest
            </button>
          )}
          <Composer
            ref={composerRef}
            variant="dock"
            value={input}
            onChange={onInputChange}
            onSubmit={onSubmit}
            disabled={isBusy}
            placeholder="Ask a follow-up..."
            onAttach={onAttach}
            onMic={onMic}
          />
          <p className="dock-footnote">Answers are generated by AI from web results and may contain mistakes.</p>
        </div>
      </div>
    </>
  );
};

export default ConversationView;
