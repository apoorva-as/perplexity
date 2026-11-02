import {
  BrandMark,
  CloseIcon,
  HistoryIcon,
  LogOutIcon,
  MoonIcon,
  NewChatIcon,
  PanelLeftIcon,
  SearchIcon,
  SunIcon,
  TrashIcon,
} from "../../../shared/components/Icons";
import { cleanDisplayText } from "../utils/chat.utils";

const RECENT_LIMIT = 8;

const Sidebar = ({
  activeTab,
  chats,
  currentChatId,
  isLoadingChats,
  collapsed,
  mobileOpen,
  isLight,
  username,
  onSearch,
  onChats,
  onNewChat,
  onOpenChat,
  onDeleteChat,
  onToggleTheme,
  onToggleCollapse,
  onCloseMobile,
  onLogout,
  isLoggingOut,
}) => {
  const recentChats = chats.slice(0, RECENT_LIMIT);
  const classes = ["sidebar", collapsed && "collapsed", mobileOpen && "open"].filter(Boolean).join(" ");

  return (
    <>
      {mobileOpen && (
        <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={onCloseMobile} />
      )}

      <aside id="app-sidebar" className={classes} aria-label="Primary">
        <div className="sidebar-header">
          <button type="button" className="sidebar-brand" onClick={onNewChat} aria-label="Perplexity home">
            <BrandMark size={22} />
            <span>Perplexity</span>
          </button>

          <button
            type="button"
            className="icon-btn desktop-only"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftIcon size={17} />
          </button>
          <button type="button" className="icon-btn mobile-only" onClick={onCloseMobile} aria-label="Close navigation">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="sidebar-section">
          <button
            type="button"
            onClick={onNewChat}
            className={`sidebar-new-chat ${collapsed ? "has-tooltip" : ""}`}
            data-tooltip="New Chat"
            aria-label="New Chat"
          >
            <NewChatIcon size={16} />
            <span className="hide-collapsed">New Chat</span>
          </button>

          <nav className="sidebar-nav" aria-label="Main">
            <button
              type="button"
              onClick={onSearch}
              className={`nav-item ${activeTab === "search" ? "active" : ""} ${collapsed ? "has-tooltip" : ""}`}
              aria-current={activeTab === "search" ? "page" : undefined}
              data-tooltip="Search"
            >
              <SearchIcon size={17} />
              <span className="hide-collapsed">Search</span>
            </button>
            <button
              type="button"
              onClick={onChats}
              className={`nav-item ${activeTab === "chats" ? "active" : ""} ${collapsed ? "has-tooltip" : ""}`}
              aria-current={activeTab === "chats" ? "page" : undefined}
              data-tooltip="Chats"
            >
              <HistoryIcon size={17} />
              <span className="hide-collapsed">Chats</span>
            </button>
          </nav>
        </div>

        <section className="sidebar-recent hide-collapsed" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="sidebar-label">
            Recent
          </h2>

          <div className="sidebar-recent-list scroll-area">
            {isLoadingChats && !chats.length ? (
              <div className="sidebar-skeleton" aria-label="Loading conversations">
                {[78, 62, 86, 54, 70].map((width) => (
                  <span key={width} className="skeleton" style={{ width: `${width}%`, height: 12 }} />
                ))}
              </div>
            ) : recentChats.length ? (
              <>
                <ul className="chat-list">
                  {recentChats.map((item) => {
                    const title = cleanDisplayText(item.title) || "Untitled";
                    const isActive = item.id === currentChatId;
                    return (
                      <li key={item.id} className={`chat-row ${isActive ? "active" : ""}`}>
                        <button
                          type="button"
                          className="chat-row-main"
                          onClick={() => onOpenChat(item.id)}
                          aria-current={isActive ? "true" : undefined}
                          title={title}
                        >
                          <span className="chat-row-title">{title}</span>
                        </button>
                        <button
                          type="button"
                          className="icon-btn sm chat-row-delete"
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
                {chats.length > RECENT_LIMIT && (
                  <button type="button" className="sidebar-view-all" onClick={onChats}>
                    View all {chats.length} chats
                  </button>
                )}
              </>
            ) : (
              <p className="sidebar-empty">Your conversations will appear here.</p>
            )}
          </div>
        </section>

        <div className="sidebar-footer">
          <button
            type="button"
            role="switch"
            aria-checked={isLight}
            onClick={onToggleTheme}
            className={`theme-switch ${collapsed ? "has-tooltip" : ""}`}
            data-tooltip={isLight ? "Dark mode" : "Light mode"}
            aria-label="Light mode"
          >
            {isLight ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            <span className="hide-collapsed">{isLight ? "Light mode" : "Dark mode"}</span>
            <span className="theme-switch-track hide-collapsed" aria-hidden="true" />
          </button>

          <div className="profile" title={username}>
            <span className="avatar" aria-hidden="true">
              {username.slice(0, 1).toUpperCase()}
            </span>
            <span className="profile-text hide-collapsed">
              <span className="profile-name">{username}</span>
              <span className="profile-meta">Personal account</span>
            </span>
            <button
              type="button"
              className="icon-btn sm profile-logout hide-collapsed"
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Log out"
              title="Log out"
            >
              {isLoggingOut ? <span className="spinner sm" /> : <LogOutIcon size={15} />}
            </button>
          </div>
          <button
            type="button"
            className="nav-item has-tooltip collapsed-only"
            onClick={onLogout}
            disabled={isLoggingOut}
            data-tooltip="Log out"
            aria-label="Log out"
          >
            <LogOutIcon size={17} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
