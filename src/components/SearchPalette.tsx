import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { search, type SearchHit } from "@/lib/content";
import { SECTIONS } from "@/data/taxonomy";
import { navigate } from "@/lib/router";
import { Icon } from "@/components/Icon";
import { cn } from "@/utils/cn";

const RECENT_KEY = "wpsl:recent-searches";
const POPULAR = ["500", "woocommerce", "memory", "ssl", "redirect", "elementor", "fatal", "ftp", "database", "cache"];

const sectionOf = (id: string) => SECTIONS.find((s) => s.id === id);

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 6);
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const hits: SearchHit[] = useMemo(() => (query.trim().length > 1 ? search(query, 14) : []), [query]);

  useEffect(() => {
    if (open) {
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const remember = (q: string) => {
    if (q.trim().length < 2) return;
    const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const go = (slug: string) => {
    remember(query);
    onClose();
    setQuery("");
    navigate(slug);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center px-3 pt-[6vh] sm:px-4 sm:pt-[12vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the knowledge base"
        className="card relative flex w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: "min(80dvh, 720px)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter" && hits[index]) {
            e.preventDefault();
            go(hits[index].article.slug);
          }
        }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--color-wp-border-light)" }}>
          <Search className="h-4 w-4 shrink-0" style={{ color: "var(--color-wp-text-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            placeholder="Search errors, plugins, hosting, PHP, WooCommerce…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--color-wp-text-muted)]"
            style={{ color: "var(--color-wp-text)" }}
          />
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-[var(--color-wp-body)]"
            style={{ color: "var(--color-wp-text-muted)" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
          {!query && (
            <div className="p-2 sm:p-3">
              {recent.length > 0 && (
                <>
                  <p className="eyebrow mb-2">Recent</p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {recent.map((r) => (
                      <button key={r} onMouseDown={() => setQuery(r)} className="btn-ghost">
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="eyebrow mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR.map((p) => (
                  <button key={p} onMouseDown={() => setQuery(p)} className="btn-ghost">
                    {p}
                  </button>
                ))}
              </div>
              <p className="eyebrow mt-5">Jump to a section</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {SECTIONS.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    onMouseDown={() => {
                      onClose();
                      navigate(`/category/${s.id}`);
                    }}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition hover:bg-[var(--color-wp-blue-wash)]"
                    style={{ color: "var(--color-wp-text-secondary)" }}
                  >
                    <Icon name={s.icon} className="h-4 w-4" style={{ color: "var(--color-wp-text-muted)" } as React.CSSProperties} />
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length > 1 && hits.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: "var(--color-wp-text-secondary)" }}>
              No article matches "{query}". Try a smaller term like <em>fatal</em>, <em>cache</em> or <em>mysql</em>.
            </p>
          )}

          {hits.map((hit, i) => {
            const s = sectionOf(hit.article.section);
            return (
              <button
                key={hit.article.slug}
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(hit.article.slug)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition",
                  i === index ? "bg-[var(--color-wp-blue-wash)]" : "hover:bg-[var(--color-wp-body)]",
                )}
              >
                <span
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md"
                  style={{ backgroundColor: "var(--color-wp-body)", color: "var(--color-wp-text-secondary)" }}
                >
                  <Icon name={s?.icon ?? "resources"} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider" style={{ color: "var(--color-wp-text-muted)" }}>
                    {s?.title ?? hit.article.section}
                  </span>
                  <span className="block text-[14.5px] font-semibold" style={{ color: "var(--color-wp-text)" }}>{hit.article.title}</span>
                  {hit.excerpt && (
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px]" style={{ color: "var(--color-wp-text-secondary)" }}>
                      {hit.excerpt}
                    </span>
                  )}
                </span>
                {i === index && <ArrowRight className="mt-2 h-4 w-4 shrink-0" style={{ color: "var(--color-wp-blue)" }} />}
              </button>
            );
          })}
        </div>

        <div
          className="flex items-center justify-between border-t px-4 py-2 font-mono text-[10.5px]"
          style={{ borderColor: "var(--color-wp-border-light)", backgroundColor: "var(--color-wp-body)", color: "var(--color-wp-text-muted)" }}
        >
          <span className="flex items-center gap-2">
            <kbd className="rounded border px-1" style={{ borderColor: "var(--color-wp-border)" }}>↑↓</kbd> navigate
            <kbd className="inline-flex items-center rounded border px-1" style={{ borderColor: "var(--color-wp-border)" }}>
              <CornerDownLeft className="h-2.5 w-2.5" />
            </kbd>
            open
          </span>
          <span>{hits.length ? `${hits.length} result${hits.length > 1 ? "s" : ""}` : "local index · no server"}</span>
        </div>
      </div>
    </div>
  );
}
