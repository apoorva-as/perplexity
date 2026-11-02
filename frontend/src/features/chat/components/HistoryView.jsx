import { useMemo, useState } from "react";
import { MessageIcon, NewChatIcon, SearchIcon, TrashIcon } from "../../../shared/components/Icons";
import { cleanDisplayText, formatShortDate, groupChatsByDate } from "../utils/chat.utils";

const HistorySkeleton = () => (
  <ul className="history-list" aria-label="Loading conversations">
    {[64, 48, 72, 56, 40].map((width) => (
      <li key={width} className="history-item">
        <div className="history-item-main">
          <span className="skeleton" style={{ width: 16, height: 16 }} />
          <span className="skeleton" style={{ width: `${width}%`, height: 12 }} />
        </div>
      </li>
    ))}
  </ul>
);

const HistoryView = ({ chats, currentChatId, isLoading, onOpenChat, onDeleteChat, onNewChat }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return chats;
    return chats.filter((chat) => cleanDisplayText(chat.title).toLowerCase().includes(term));
  }, [chats, query]);

  const groups = useMemo(() => groupChatsByDate(filtered), [filtered]);
  const isInitialLoad = isLoading && !chats.length;

  return (
    <div className="history scroll-area">
      <div className="history-inner view-enter">
        <header className="history-header">
          <div>
            <h1 className="history-title">Chats</h1>
            <p className="history-subtitle">
              {chats.length
                ? `${chats.length} conversation${chats.length === 1 ? "" : "s"}`
                : "Your conversation history"}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onNewChat} aria-label="New Chat">
            <NewChatIcon size={15} />
            <span>New Chat</span>
          </button>
        </header>

        {chats.length > 0 && (
          <div className="search-field">
            <SearchIcon size={15} />
            <label htmlFor="history-search" className="sr-only">
              Search your chats
            </label>
            <input
              id="history-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your chats..."
              autoComplete="off"
            />
          </div>
        )}

        {isInitialLoad ? (
          <HistorySkeleton />
        ) : !chats.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <MessageIcon size={20} />
            </span>
            <h3>No conversations yet</h3>
            <p>Ask your first question and it will be saved here so you can pick it back up anytime.</p>
            <button type="button" className="btn btn-primary" onClick={onNewChat}>
              <SearchIcon size={15} />
              Start searching
            </button>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">
              <SearchIcon size={20} />
            </span>
            <h3>No matching chats</h3>
            <p>Nothing matches “{query.trim()}”. Try a different keyword.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="history-group" aria-label={group.label}>
              <h2 className="history-group-label">{group.label}</h2>
              <ul className="history-list">
                {group.items.map((item) => {
                  const title = cleanDisplayText(item.title) || "Untitled";
                  const isActive = item.id === currentChatId;
                  return (
                    <li key={item.id} className={`history-item ${isActive ? "active" : ""}`}>
                      <button type="button" className="history-item-main" onClick={() => onOpenChat(item.id)}>
                        <MessageIcon size={16} className="history-item-icon" />
                        <span className="history-item-title">{title}</span>
                        <span className="history-item-date">{formatShortDate(item.lastUpdated)}</span>
                      </button>
                      <button
                        type="button"
                        className="icon-btn sm history-item-delete"
                        onClick={(event) => onDeleteChat(event, item.id)}
                        aria-label={`Delete ${title}`}
                        title="Delete"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
