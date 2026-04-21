import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import { useChat } from "../hooks/useChat";
import { setCurrentChatId } from "../chat.slice";

const categoryPrompts = {
  search: [
    "Trending Tech",
    "Startups",
    "AI Tools",
    "Gadgets",
  ],
  chats: [
    "Productivity",
    "Saved Threads",
    "Research Notes",
    "Team Updates",
  ]
 
};

const starterPrompts = [
  "Summarize this: Tech News | Today's Latest Technology News - Reuters",
  "Tell me more about Tech | CNN Business...",
  "What are the top 5 programming news today?",
];

const formatTime = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const cleanDisplayText = (content = '') =>
  content
    .replace(/\\\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/"/g, '')
    .trim();

const buildShareText = (messages = []) =>
  messages.map((message) => `${message.role === "user" ? "You" : "Perplexity"}: ${cleanDisplayText(message.content)}`).join('');

const Icon = ({ children, className = "h-4 w-4" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
);

const SidebarButton = ({ active, children, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-base transition ${
      active ? "bg-white/8 text-white" : "text-white/65 hover:bg-white/4 hover:text-white"
    }`}
  >
    <Icon>{icon}</Icon>
    <span>{children}</span>
  </button>
);

const Dashboard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [showAllChats, setShowAllChats] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const chatError = useSelector((state) => state.chat.error);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChatId, chats]);

  const orderedChats = useMemo(
    () =>
      Object.values(chats).sort((a, b) => {
        const dateA = new Date(a.lastUpdated || 0).getTime();
        const dateB = new Date(b.lastUpdated || 0).getTime();
        return dateB - dateA;
      }),
    [chats]
  );

  const currentMessages = chats[currentChatId]?.messages ?? [];
  const hasActiveConversation = currentMessages.length > 0;
  const visibleChats = showAllChats ? orderedChats : orderedChats.slice(0, 4);
  const promptChips = categoryPrompts[activeTab];
  const selectedTopic = cleanDisplayText(currentChatId ? chats[currentChatId]?.title || "Knowledge" : promptChips[0]);
  const username = user?.username || "Guest";

  const submitMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    await chat.handleSendMessage({
      message: trimmedMessage,
      chatId: currentChatId,
    });
    setChatInput("");
    setActiveTab("search");
  };

  const openChat = async (chatId) => {
    await chat.handleOpenChat(chatId, chats);
    setActiveTab("search");
  };

  const deleteExistingChat = async (event, chatId) => {
    event.stopPropagation();
    await chat.handleDeleteChat(chatId);
  };

  const resetConversation = () => {
    dispatch(setCurrentChatId(null));
    setActiveTab("search");
    setChatInput("");
    setCopied(false);
  };

  const prefillPrompt = (prompt) => {
    setChatInput(prompt);
  };

  const copyShareLink = async () => {
    if (!currentMessages.length || !navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(buildShareText(currentMessages));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggleChatsPanel = () => {
    setActiveTab((current) => (current === "chats" ? "search" : "chats"));
  };

  return (
    <main className={lightMode ? "dashboard-theme light" : "dashboard-theme"}>
      <section className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div>
            <SidebarButton active={activeTab === "search"} onClick={() => setActiveTab("search")} icon={<SearchIcon />}>
              Search
            </SidebarButton>
            <SidebarButton active={activeTab === "chats"} onClick={toggleChatsPanel} icon={<HistoryIcon />}>
              Chats
            </SidebarButton>
            

            <button type="button" onClick={resetConversation} className="dashboard-new-chat">
              <Icon>
                <PlusIcon />
              </Icon>
              <span>New Chat</span>
            </button>

            <div className="dashboard-recent">
              <div className="dashboard-recent-header">
                <span>Recent</span>
              </div>

              <div className="dashboard-recent-list">
                {visibleChats.length ? (
                  visibleChats.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openChat(item.id)}
                      className={`dashboard-chat-item ${item.id === currentChatId ? "active" : ""}`}
                    >
                      <span className="truncate">{cleanDisplayText(item.title)}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => deleteExistingChat(event, item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Delete' || event.key === 'Backspace') {
                            deleteExistingChat(event, item.id);
                          }
                        }}
                        className="dashboard-delete"
                      >
                        <TrashIcon />
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="dashboard-empty-copy"></p>
                )}
              </div>

              
            </div>
          </div>

          <div className="dashboard-sidebar-footer">
            <button type="button" onClick={() => setLightMode((value) => !value)} className="dashboard-mode-toggle">
              <Icon>
                <SunIcon />
              </Icon>
              <span>{lightMode ? "Dark Mode" : "Light Mode"}</span>
            </button>

            <div className="dashboard-profile">
              <div className="dashboard-avatar">{username.slice(0, 1).toUpperCase()}</div>
              <span>{username}</span>
            </div>
          </div>
        </aside>

        <section className="dashboard-content">
          {!hasActiveConversation ? (
            <div className="dashboard-home">
              <div className="dashboard-brand-block">
                <div className="dashboard-logo-mark">
                  <SearchIcon />
                </div>
                <h1 className="dashboard-brand-wordmark">Perplexity</h1>
              </div>

              <div className="dashboard-category-row">
                {promptChips.map((chip) => (
                  <button key={chip} type="button" onClick={() => prefillPrompt(chip)} className="dashboard-chip">
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={submitMessage} className="dashboard-composer dashboard-composer-home">
                <textarea
                  rows={3}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={
                    activeTab === "insta" ? "Create an Instagram post idea..." : "Ask anything..."
                  }
                  className="dashboard-textarea"
                />
                <div className="dashboard-composer-actions">
                  <button type="button" className="dashboard-round-button" onClick={() => prefillPrompt(promptChips[0])}>
                    <PlusIcon />
                  </button>

                  <div className="dashboard-composer-right">
                    <button type="button" className="dashboard-ghost-icon" onClick={() => prefillPrompt("Use voice input prompt")}>
                      <MicIcon />
                    </button>
                    <button type="submit" disabled={!chatInput.trim() || isLoading} className="dashboard-round-button submit">
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>
              </form>

              <div className="dashboard-suggestion-list">
                {starterPrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => prefillPrompt(prompt)} className="dashboard-suggestion">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-result">
              <div className="dashboard-result-topbar">
                <div className="dashboard-result-tab">Knowledge</div>
                <button type="button" onClick={copyShareLink} className="dashboard-share">
                  <ShareIcon />
                  <span>{copied ? "Copied" : "Share"}</span>
                </button>
              </div>

              <div ref={scrollRef} className="dashboard-message-stream">
                <div className="dashboard-result-header">
                  <div className="dashboard-result-topic">{selectedTopic}</div>
                </div>

                <div className="dashboard-message-list">
                  {currentMessages.map((message, index) => (
                    <article
                      key={`${message.role}-${index}`}
                      className={`dashboard-message ${message.role === "user" ? "user" : "ai"}`}
                    >
                      {message.role === "user" ? (
                        <p>{message.content}</p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="dashboard-markdown-paragraph">{children}</p>,
                            ul: ({ children }) => <ul className="dashboard-markdown-list">{children}</ul>,
                            ol: ({ children }) => <ol className="dashboard-markdown-list ordered">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            code: ({ children }) => <code className="dashboard-inline-code">{children}</code>,
                            pre: ({ children }) => <pre className="dashboard-code-block">{children}</pre>,
                          }}
                        >
                          {cleanDisplayText(message.content)}
                        </ReactMarkdown>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <div className="dashboard-followup-shell">
                <button type="button" className="dashboard-scroll-button" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}>
                  <ArrowDownIcon />
                </button>

                <form onSubmit={submitMessage} className="dashboard-composer dashboard-composer-followup">
                  <textarea
                    rows={3}
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask anything....."
                    className="dashboard-textarea"
                  />
                  <div className="dashboard-composer-actions">
                    <button type="button" className="dashboard-attach" onClick={() => prefillPrompt("Create a follow-up based on this answer")}>
                      <PlusIcon />
                      <span>Attach</span>
                    </button>

                    <div className="dashboard-composer-right">
                      <button type="button" className="dashboard-ghost-icon" onClick={() => prefillPrompt("Convert this response into a short summary")}>
                        <MicIcon />
                      </button>
                      <button type="submit" disabled={!chatInput.trim() || isLoading} className="dashboard-round-button submit">
                        <ArrowUpIcon />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {(isLoading || chatError) && (
            <div className="dashboard-status">
              {isLoading ? "Generating response..." : chatError}
            </div>
          )}

          {activeTab === "chats" && !hasActiveConversation && orderedChats.length > 0 && (
            <div className="dashboard-tab-panel">
              <div className="dashboard-history-title">History</div>
              {orderedChats.map((item) => (
                <button key={item.id} type="button" onClick={() => openChat(item.id)} className="dashboard-tab-chat">
                  <div>
                    <p>{cleanDisplayText(item.title)}</p>
                    <span>{formatTime(item.lastUpdated)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

         
        </section>
      </section>
    </main>
  );
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 3.75 12 8.5l1.5-4.75L15 8.5l4.75-1.5L15 10.5l4.75 1.5L15 13.5l-1.5 4.75L12 13.5l-1.5 4.75L9 13.5 4.25 15 9 12 4.25 10.5 9 8.5l1.5-4.75Z" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7.5V12l3 1.5" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M8 10v7" />
    <path d="M12 10v7" />
    <path d="M16 10v7" />
    <path d="M6.5 7l1 12h9l1-12" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <path d="M12 17v4" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19 0-14" />
    <path d="m7 10 5-5 5 5" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="m17 14-5 5-5-5" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.3 11 7.4-4.4" />
    <path d="m8.3 13 7.4 4.4" />
  </svg>
);

export default Dashboard;
