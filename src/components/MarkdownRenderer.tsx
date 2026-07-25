"use client";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: Props) {
  return (
    <div
      className={`prose prose-invert prose-sm max-w-none
        prose-p:text-[#CBD5E1] prose-p:leading-relaxed
        prose-headings:text-white prose-headings:font-bold
        prose-strong:text-white
        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-violet-500 prose-blockquote:text-[#94A3B8]
        prose-hr:border-white/10
        prose-li:text-[#CBD5E1]
        ${className}`}
    >
      <ReactMarkdown
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            return isInline ? (
              <code
                className="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark as any}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: "0.75rem",
                  fontSize: "0.82rem",
                  margin: "1rem 0",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
