import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hook/useAuth";
import { AlertIcon, BrandMark, CheckIcon, CloseIcon, MenuIcon, NewChatIcon, ShareIcon } from "../../../shared/components/Icons";
import { useCopyToClipboard } from "../../../shared/hooks/useCopyToClipboard";
import { useTheme } from "../../../shared/hooks/useTheme";
import { setCurrentChatId, setError } from "../chat.slice";
import ConversationView from "../components/ConversationView";
import HistoryView from "../components/HistoryView";
import HomeView from "../components/HomeView";
import Sidebar from "../components/Sidebar";
import { useChat } from "../hooks/useChat";
import { buildShareText, cleanDisplayText } from "../utils/chat.utils";

const categoryPrompts = ["Trending Tech", "Startups", "AI Tools", "Gadgets"];

const starterPrompts = [
  "Summarize this: Tech News | Today's Latest Technology News - Reuters",
  "Tell me more about Tech | CNN Business...",
  "What are the top 5 programming news today?",
];

const COLLAPSE_KEY = "sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "true";
  } catch {
    return false;
  }
};

const Dashboard = () => {
  const chat = useChat();
  const dispatch = useDispatch();
  const { isLight, toggleTheme } = useTheme();
  const share = useCopyToClipboard();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  // Shown optimistically while the AI response is on its way.
  const [pending, setPending] = useState(null);
  const [openingChatId, setOpeningChatId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [threadScrolled, setThreadScrolled] = useState(false);
  const composerRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const chatError = useSelector((state) => state.chat.error);
  const user = useSelector((state) => state.auth.user);

  // Mount only: connect the socket and load history once.
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    } catch {
      // Ignore unavailable storage.
    }
  }, [collapsed]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const orderedChats = useMemo(
    () =>
      Object.values(chats).sort((a, b) => {
        const dateA = new Date(a.lastUpdated || 0).getTime();
        const dateB = new Date(b.lastUpdated || 0).getTime();
        return dateB - dateA;
      }),
    [chats]
  );

  const currentMessages = useMemo(() => chats[currentChatId]?.messages ?? [], [chats, currentChatId]);
  const showPending =
    Boolean(pending) && pending.chatId === currentChatId && currentMessages.length === pending.baseCount;
  const displayedMessages = openingChatId ? [] : currentMessages;
  const hasConversation = displayedMessages.length > 0 || showPending || Boolean(openingChatId);
  const isLoadingChats = isLoading && !orderedChats.length && !pending && !openingChatId;
  const username = user?.username || "Guest";

  const conversationTitle = cleanDisplayText(
    chats[openingChatId || currentChatId]?.title || pending?.text || "New thread"
  );

  useEffect(() => {
    const view = activeTab === "chats" ? "Chats" : hasConversation ? conversationTitle : null;
    document.title = view ? `${view} · Perplexity` : "Perplexity";
  }, [activeTab, hasConversation, conversationTitle]);

  const focusComposer = useCallback(() => {
    window.requestAnimationFrame(() => {
      const el = composerRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const submitMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    setPending({ text: trimmedMessage, chatId: currentChatId, baseCount: currentMessages.length });
    setChatInput("");
    setActiveTab("search");

    const success = await chat.handleSendMessage({
      message: trimmedMessage,
      chatId: currentChatId,
    });

    setPending(null);
    if (!success) {
      // Give the user their text back so they can retry.
      setChatInput((current) => current || trimmedMessage);
    }
  };

  const openChat = async (chatId) => {
    setActiveTab("search");
    setMobileNavOpen(false);
    if (!chats[chatId]?.messages.length) setOpeningChatId(chatId);
    await chat.handleOpenChat(chatId, chats);
    setOpeningChatId(null);
  };

  const deleteExistingChat = async (event, chatId) => {
    event.stopPropagation();
    await chat.handleDeleteChat(chatId);
  };

  const resetConversation = () => {
    dispatch(setCurrentChatId(null));
    setActiveTab("search");
    setChatInput("");
    setMobileNavOpen(false);
    share.reset();
    focusComposer();
  };

  const prefillPrompt = (prompt) => {
    setChatInput(prompt);
    focusComposer();
  };

  const copyShareLink = () => {
    if (!currentMessages.length) return;
    share.copy(buildShareText(currentMessages));
  };

  const logout = async () => {
    setIsLoggingOut(true);
    const success = await handleLogout();
    if (success) {
      navigate("/login", { replace: true });
    } else {
      setIsLoggingOut(false);
    }
  };

  const showSearch = () => {
    setActiveTab("search");
    setMobileNavOpen(false);
  };

  const toggleChatsPanel = () => {
    setActiveTab((current) => (current === "chats" ? "search" : "chats"));
    setMobileNavOpen(false);
  };

  const inConversation = activeTab === "search" && hasConversation;

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        chats={orderedChats}
        currentChatId={currentChatId}
        isLoadingChats={isLoadingChats}
        collapsed={collapsed}
        mobileOpen={mobileNavOpen}
        isLight={isLight}
        username={username}
        onSearch={showSearch}
        onChats={toggleChatsPanel}
        onNewChat={resetConversation}
        onOpenChat={openChat}
        onDeleteChat={deleteExistingChat}
        onToggleTheme={toggleTheme}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onLogout={logout}
        isLoggingOut={isLoggingOut}
      />

      <main className="app-main">
        <header className={`app-topbar ${inConversation && threadScrolled ? "bordered" : ""}`}>
          <div className="app-topbar-left">
            <button
              type="button"
              className="icon-btn mobile-only"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
              aria-controls="app-sidebar"
            >
              <MenuIcon size={18} />
            </button>

            {inConversation ? (
              <h1 className="app-topbar-title" title={conversationTitle}>
                {conversationTitle}
              </h1>
            ) : (
              <span className="app-topbar-title app-topbar-brand mobile-only">
                <BrandMark size={18} />
                Perplexity
              </span>
            )}
          </div>

          <div className="app-topbar-right">
            {inConversation && currentMessages.length > 0 && (
              <button
                type="button"
                onClick={copyShareLink}
                className="btn btn-secondary"
                aria-label={share.copied ? "Conversation copied" : "Share conversation"}
                title="Copy conversation"
              >
                {share.copied ? <CheckIcon size={15} /> : <ShareIcon size={15} />}
                <span>{share.copied ? "Copied" : "Share"}</span>
              </button>
            )}
            <button type="button" className="icon-btn mobile-only" onClick={resetConversation} aria-label="New Chat">
              <NewChatIcon size={17} />
            </button>
          </div>
        </header>

        {activeTab === "chats" ? (
          <HistoryView
            chats={orderedChats}
            currentChatId={currentChatId}
            isLoading={isLoading}
            onOpenChat={openChat}
            onDeleteChat={deleteExistingChat}
            onNewChat={resetConversation}
          />
        ) : hasConversation ? (
          <ConversationView
            key={currentChatId || "new"}
            messages={displayedMessages}
            pendingMessage={showPending ? pending.text : null}
            isOpening={Boolean(openingChatId)}
            input={chatInput}
            onInputChange={setChatInput}
            onSubmit={submitMessage}
            isBusy={isLoading}
            onAttach={() => prefillPrompt("Create a follow-up based on this answer")}
            onMic={() => prefillPrompt("Convert this response into a short summary")}
            composerRef={composerRef}
            onScrolledChange={setThreadScrolled}
          />
        ) : (
          <HomeView
            categories={categoryPrompts}
            suggestions={starterPrompts}
            input={chatInput}
            onInputChange={setChatInput}
            onSubmit={submitMessage}
            isBusy={isLoading}
            onPrefill={prefillPrompt}
            onAttach={() => prefillPrompt(categoryPrompts[0])}
            onMic={() => prefillPrompt("Use voice input prompt")}
            composerRef={composerRef}
          />
        )}
      </main>

      {chatError && (
        <div className="toast" role="alert">
          <AlertIcon size={16} />
          <span className="toast-text">{chatError}</span>
          <button
            type="button"
            className="icon-btn sm"
            onClick={() => dispatch(setError(null))}
            aria-label="Dismiss"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
