import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckIcon, CopyIcon } from "../../../shared/components/Icons";
import { useCopyToClipboard } from "../../../shared/hooks/useCopyToClipboard";
import { hastToText } from "../utils/chat.utils";

const CodeBlock = ({ node, children }) => {
  const { copied, copy } = useCopyToClipboard();
  const codeNode = node?.children?.find((child) => child.tagName === "code");
  const languageClass = (codeNode?.properties?.className || []).find((name) => String(name).startsWith("language-"));
  const language = languageClass ? String(languageClass).replace("language-", "") : "code";

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language}</span>
        <button type="button" className="btn btn-ghost" onClick={() => copy(hastToText(codeNode).replace(/\n$/, ""))}>
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scroll-area">{children}</pre>
    </div>
  );
};

const components = {
  pre: CodeBlock,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="table-wrap scroll-area">
      <table>{children}</table>
    </div>
  ),
};

const MarkdownAnswer = ({ content }) => (
  <div className="answer">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
);

export default memo(MarkdownAnswer);
