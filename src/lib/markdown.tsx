import { useState } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/router";
import { Icon } from "@/components/Icon";
import { cn } from "@/utils/cn";

/* ────────────────────────────────────────────────────────────────
   Minimal, dependency-free Markdown → React renderer.
   Supports exactly what the article template needs:
   headings, paragraphs, lists (incl. checklists), tables,
   blockquotes, fenced code, ::: callouts and inline formatting.
   ──────────────────────────────────────────────────────────────── */

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    const text = m[2].replace(/[*`]/g, "").trim();
    let id = slugify(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    items.push({ id, text, level });
  }
  return items;
}

/* ── inline formatting ─────────────────────────────────────────── */

const INLINE =
  /(`[^`]+`|\*\*[^*]+\*\*|(?<![A-Za-z0-9_])__[^_\n]+__(?![A-Za-z0-9_])|~~[^~]+~~|\[[^\]]+\]\([^)\s]+\)|\*[^*\n]+\*|(?<![A-Za-z0-9_])_[^_\n]+_(?![A-Za-z0-9_]))/g;

function Inline({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  const src = text;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(src))) {
    if (match.index > last) nodes.push(src.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("~~")) {
      nodes.push(
        <span key={key++} className="line-through opacity-70">
          {token.slice(2, -2)}
        </span>,
      );
    } else if (token.startsWith("[")) {
      const lm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(token);
      if (lm) {
        const [, label, href] = lm;
        nodes.push(
          href.startsWith("/") ? (
            <Link key={key++} to={href}>
              {label}
            </Link>
          ) : (
            <a key={key++} href={href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-0.5">
              {label}
              <ArrowUpRight className="h-3 w-3 opacity-60" aria-hidden />
            </a>
          ),
        );
      } else nodes.push(token);
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < src.length) nodes.push(src.slice(last));
  return <>{nodes}</>;
}

/* ── code block ────────────────────────────────────────────────── */

/* ── code block ────────────────────────────────────────────────── */

const HIGHLIGHT_KEYWORDS = new Set([
  // Shell & WP-CLI
  "wp", "sudo", "curl", "chmod", "chown", "systemctl", "service", "grep", "tail", "head",
  "cat", "rm", "ls", "mkdir", "cd", "mv", "cp", "find", "stat", "sed", "awk", "du", "df",
  "touch", "echo", "mysqldump", "mysql", "tar", "gzip", "unzip", "nano", "vim", "kill", "ps",
  // PHP & WordPress
  "php", "function", "return", "if", "else", "elseif", "while", "foreach", "for", "true",
  "false", "null", "define", "defined", "add_action", "add_filter", "global", "class",
  "public", "private", "protected", "try", "catch", "throw", "new", "require", "include",
  "require_once", "include_once", "echo", "die", "exit",
  // Apache & Nginx
  "RewriteEngine", "RewriteRule", "RewriteCond", "RewriteBase", "DirectoryIndex", "Order",
  "Allow", "Deny", "Require", "Header", "server", "location", "listen", "root", "index",
  "try_files", "fastcgi_pass", "proxy_pass",
  // SQL
  "SELECT", "UPDATE", "DELETE", "INSERT", "INTO", "FROM", "WHERE", "AND", "OR", "SET",
  "LIMIT", "ORDER", "BY", "GROUP", "JOIN", "LEFT", "INNER", "TABLE", "DATABASE", "SHOW",
]);

function highlightLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return "\u00A0";

  // Comments
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("--") ||
    trimmed.startsWith(";")
  ) {
    return <span className="text-[#8c8f94] italic">{line}</span>;
  }

  // Shell prompt
  let content = line;
  let promptNode: React.ReactNode = null;
  if (line.startsWith("$ ")) {
    promptNode = <span className="select-none font-semibold text-[#50575e]">$ </span>;
    content = line.slice(2);
  }

  const tokens: React.ReactNode[] = [];
  const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|--?[a-zA-Z0-9_-]+|\$[a-zA-Z0-9_]+|\b[a-zA-Z0-9_]+\b|[^\s\w"'-]+|\s+)/g;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = regex.exec(content))) {
    const t = m[0];
    if (t.startsWith('"') || t.startsWith("'")) {
      tokens.push(<span key={k++} className="text-[#7ee787]">{t}</span>);
    } else if (t.startsWith("--") || (t.startsWith("-") && t.length > 1 && !/^\s*-\d+$/.test(t))) {
      tokens.push(<span key={k++} className="text-[#fdba74]">{t}</span>);
    } else if (t.startsWith("$") && t.length > 1) {
      tokens.push(<span key={k++} className="text-[#c084fc]">{t}</span>);
    } else if (HIGHLIGHT_KEYWORDS.has(t) || HIGHLIGHT_KEYWORDS.has(t.toLowerCase()) || HIGHLIGHT_KEYWORDS.has(t.toUpperCase())) {
      tokens.push(<span key={k++} className="font-medium text-[#72aee6]">{t}</span>);
    } else if (/^\d+$/.test(t)) {
      tokens.push(<span key={k++} className="text-[#93c5fd]">{t}</span>);
    } else {
      tokens.push(t);
    }
  }

  return (
    <>
      {promptNode}
      {tokens.length > 0 ? tokens : content}
    </>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  };

  const lines = code.replace(/\r\n/g, "\n").split("\n");
  const showLineNumbers = lines.length > 2;

  return (
    <figure
      className="group relative my-4 overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm"
    >
      <figcaption
        className="flex items-center justify-between border-b border-[var(--color-wp-dark-mid)] bg-[#191e23] px-3.5 py-2"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#a7aaad]">
            {lang || "shell"}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#c3c4c7] transition hover:bg-white/15 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-[#7ee787]" /> : <Copy className="h-3 w-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </figcaption>
      <pre className="scrollbar-thin overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
        <code>
          {lines.map((l, idx) => (
            <div key={idx} className="flex min-w-full">
              {showLineNumbers && (
                <span className="mr-4 w-6 shrink-0 select-none text-right font-mono text-[11px] text-[#555d66]">
                  {idx + 1}
                </span>
              )}
              <span className="flex-1 whitespace-pre">{highlightLine(l)}</span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}

/* ── callout / container ───────────────────────────────────────── */

const CALLOUTS: Record<string, { tone: string; iconTone: string; icon: string; label: string }> = {
  note: { tone: "border-[rgba(34,113,177,0.25)] bg-[var(--color-wp-blue-pale)]", iconTone: "text-[var(--color-wp-blue)]", icon: "note", label: "Note" },
  tip: { tone: "border-[rgba(0,163,42,0.25)] bg-[var(--color-wp-success-light)]", iconTone: "text-[var(--color-wp-success)]", icon: "tip", label: "Tip" },
  warning: { tone: "border-[rgba(219,166,23,0.25)] bg-[var(--color-wp-warning-light)]", iconTone: "text-[#8b6914]", icon: "warning", label: "Warning" },
  danger: { tone: "border-[rgba(214,54,56,0.25)] bg-[var(--color-wp-error-light)]", iconTone: "text-[var(--color-wp-error)]", icon: "danger", label: "Stop — data risk" },
  investigate: { tone: "border-violet-300/30 bg-violet-50", iconTone: "text-violet-600", icon: "investigate", label: "Investigation mindset" },
};

function Callout({ kind, children }: { kind: string; children: React.ReactNode }) {
  const conf = CALLOUTS[kind] ?? CALLOUTS.note;
  return (
    <aside className={cn("rounded-lg border px-4 py-3.5", conf.tone)}>
      <p className="mb-1.5 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-wp-text-secondary)" }}>
        <span className={conf.iconTone}>
          <Icon name={conf.icon} className="h-4 w-4" strokeWidth={2} />
        </span>
        {conf.label}
      </p>
      <div className="text-[14.5px] leading-7">{children}</div>
    </aside>
  );
}

/* ── block parser ──────────────────────────────────────────────── */

type Node =
  | { t: "h"; level: 2 | 3 | 4; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; start: number; items: string[] }
  | { t: "check"; items: { text: string; done: boolean }[] }
  | { t: "code"; code: string; lang: string }
  | { t: "quote"; lines: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "hr" }
  | { t: "callout"; kind: string; lines: string[] };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function parseMarkdown(markdown: string): Node[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: Node[] = [];
  const ids = new Map<string, number>();
  const uniqueId = (text: string) => {
    const base = slugify(text) || "section";
    const n = ids.get(base) ?? 0;
    ids.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // fenced code
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      nodes.push({ t: "code", code: buf.join("\n"), lang });
      continue;
    }

    // ::: callout
    if (trimmed.startsWith(":::")) {
      const kind = trimmed.replace(/^:::+/, "").trim() || "note";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      nodes.push({ t: "callout", kind, lines: buf });
      continue;
    }

    // headings
    const h = /^(#{2,4})\s+(.*)$/.exec(trimmed);
    if (h) {
      const text = h[2].replace(/[*`]/g, "").trim();
      nodes.push({ t: "h", level: h[1].length as 2 | 3 | 4, text, id: uniqueId(text) });
      i++;
      continue;
    }

    // hr
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      nodes.push({ t: "hr" });
      i++;
      continue;
    }

    // table
    if (trimmed.startsWith("|") && lines[i + 1]?.trim().startsWith("|")) {
      const head = splitRow(lines[i]);
      const sep = splitRow(lines[i + 1]);
      if (sep.every((c) => /^:?-{2,}:?$/.test(c))) {
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        nodes.push({ t: "table", head, rows });
        continue;
      }
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      nodes.push({ t: "quote", lines: buf });
      continue;
    }

    // checklists
    if (/^[-*]\s+\[[ xX]\]/.test(trimmed)) {
      const items: { text: string; done: boolean }[] = [];
      while (i < lines.length && /^[-*]\s+\[[ xX]\]/.test(lines[i].trim())) {
        const t = lines[i].trim();
        items.push({ done: /\[[xX]\]/.test(t), text: t.replace(/^[-*]\s+\[[ xX]\]\s*/, "") });
        i++;
      }
      nodes.push({ t: "check", items });
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i].trim()) || /^\s{2,}\S/.test(lines[i]))) {
        if (/^[-*]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        } else {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
        }
      }
      nodes.push({ t: "ul", items });
      continue;
    }

    // ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const match = /^(\d+)[.)]\s+/.exec(trimmed);
      const start = match ? parseInt(match[1], 10) : 1;
      const items: string[] = [];
      while (i < lines.length && (/^\d+[.)]\s+/.test(lines[i].trim()) || /^\s{2,}\S/.test(lines[i]))) {
        if (/^\d+[.)]\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
          i++;
        } else {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i++;
        }
      }
      nodes.push({ t: "ol", start, items });
      continue;
    }

    // paragraph
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4}\s|```|:::|\||>|[-*]\s|\d+[.)]\s|-{3,}$)/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    nodes.push({ t: "p", text: buf.join(" ") });
  }

  return nodes;
}

export function Markdown({ markdown, className }: { markdown: string; className?: string }) {
  const nodes = parseMarkdown(markdown);
  return (
    <div className={cn("article-body", className)}>
      {nodes.map((node, idx) => {
        switch (node.t) {
          case "h":
            if (node.level === 2)
              return (
                <h2 key={idx} id={node.id}>
                  <a href={`#${node.id}`} className="no-underline!">
                    {node.text}
                  </a>
                </h2>
              );
            if (node.level === 3)
              return (
                <h3 key={idx} id={node.id}>
                  {node.text}
                </h3>
              );
            return (
              <h4 key={idx} id={node.id}>
                {node.text}
              </h4>
            );
          case "p":
            return (
              <p key={idx}>
                <Inline text={node.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={idx}>
                {node.items.map((item, k) => (
                  <li key={k}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} start={node.start}>
                {node.items.map((item, k) => (
                  <li key={k}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            );
          case "check":
            return (
              <ul key={idx} className="not-prose space-y-1.5">
                {node.items.map((item, k) => (
                  <li key={k} className="flex items-start gap-2.5 text-[14.5px]">
                    <span
                      className={cn(
                        "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px]",
                        item.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-ink-300 dark:border-ink-600",
                      )}
                      aria-hidden
                    >
                      {item.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span>
                      <Inline text={item.text} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "code":
            return <CodeBlock key={idx} code={node.code} lang={node.lang} />;
          case "quote":
            return (
              <blockquote key={idx}>
                {node.lines.map((l, k) => (
                  <p key={k} className={k ? "mt-2" : ""}>
                    <Inline text={l} />
                  </p>
                ))}
              </blockquote>
            );
          case "table":
            return (
              <div key={idx} className="scrollbar-thin overflow-x-auto rounded-xl border border-[var(--color-wp-border-light)]">
                <table>
                  <thead>
                    <tr>
                      {node.head.map((c, k) => (
                        <th key={k}>
                          <Inline text={c} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {node.rows.map((row, k) => (
                      <tr key={k}>
                        {row.map((cell, j) => (
                          <td key={j}>
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <Callout key={idx} kind={node.kind}>
                {node.lines.map((l, k) =>
                  l.trim().startsWith("-") ? (
                    <span key={k} className="mt-1 flex gap-2">
                      <span aria-hidden>•</span>
                      <span>
                        <Inline text={l.trim().replace(/^-\s*/, "")} />
                      </span>
                    </span>
                  ) : (
                    <p key={k} className={k ? "mt-1.5" : ""}>
                      <Inline text={l.trim()} />
                    </p>
                  ),
                )}
              </Callout>
            );
          case "hr":
            return <hr key={idx} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
