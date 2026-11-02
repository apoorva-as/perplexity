/* Strips markdown emphasis and quotes from short labels such as chat titles. */
export const cleanDisplayText = (content = "") =>
  String(content ?? "")
    .replace(/\\\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/"/g, "")
    .replace(/^#+\s*/, "")
    .trim();

export const buildShareText = (messages = []) =>
  messages
    .map((message) => `${message.role === "user" ? "You" : "Perplexity"}: ${cleanDisplayText(message.content)}`)
    .join("\n\n");

export const formatShortDate = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  }).format(date);
};

const DAY = 24 * 60 * 60 * 1000;

/* Groups chats (already sorted newest first) into Today / Yesterday / ... buckets. */
export const groupChatsByDate = (chats = []) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();

  const buckets = [
    { label: "Today", test: (t) => t >= today },
    { label: "Yesterday", test: (t) => t >= today - DAY },
    { label: "Previous 7 days", test: (t) => t >= today - 7 * DAY },
    { label: "Previous 30 days", test: (t) => t >= today - 30 * DAY },
    { label: "Older", test: () => true },
  ];

  const groups = new Map();
  chats.forEach((chat) => {
    const time = new Date(chat.lastUpdated || 0).getTime() || 0;
    const bucket = buckets.find((b) => b.test(time));
    if (!groups.has(bucket.label)) groups.set(bucket.label, []);
    groups.get(bucket.label).push(chat);
  });

  return Array.from(groups, ([label, items]) => ({ label, items }));
};

/* Pairs the flat message list into { query, answer } turns. */
export const groupMessagesIntoTurns = (messages = []) => {
  const turns = [];
  messages.forEach((message) => {
    if (message.role === "user") {
      turns.push({ query: message.content, answer: null });
      return;
    }
    const last = turns[turns.length - 1];
    if (last && last.answer === null) {
      last.answer = message.content;
    } else {
      turns.push({ query: null, answer: message.content });
    }
  });
  return turns;
};

export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/* Collects unique links cited in a markdown answer to show as source cards. */
export const extractSources = (markdown = "", limit = 8) => {
  const sources = [];
  const seen = new Set();
  const text = String(markdown ?? "");

  const add = (url, title) => {
    const cleanUrl = url.replace(/[.,;:!?]+$/, "");
    if (seen.has(cleanUrl)) return;
    seen.add(cleanUrl);
    const domain = getDomain(cleanUrl);
    const label = (title || "").trim();
    const looksLikeUrl = /^https?:\/\//i.test(label) || /^\d+$/.test(label) || label.length < 3;
    sources.push({ url: cleanUrl, domain, title: looksLikeUrl ? domain : label });
  };

  const markdownLink = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = markdownLink.exec(text))) add(match[2], match[1]);

  const withoutMarkdownLinks = text.replace(markdownLink, " ");
  const bareUrl = /https?:\/\/[^\s<>()[\]"']+/g;
  while ((match = bareUrl.exec(withoutMarkdownLinks))) add(match[0], "");

  return sources.slice(0, limit);
};

/* Flattens a hast node (from react-markdown) to plain text, e.g. for copying code. */
export const hastToText = (node) => {
  if (!node) return "";
  if (node.type === "text") return node.value;
  return (node.children || []).map(hastToText).join("");
};
