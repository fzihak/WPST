import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, GitBranch, Link2, Pencil, Star } from "lucide-react";
import type { Article } from "@/lib/content";
import { bySection, related } from "@/lib/content";
import { SECTIONS } from "@/data/taxonomy";
import { Markdown } from "@/lib/markdown";
import { Link } from "@/lib/router";
import { ArticleCard } from "@/components/ArticleCard";
import { Icon } from "@/components/Icon";
import { Badge, DifficultyPip, SeverityBadge, Tag } from "@/components/ui";
import { cn } from "@/utils/cn";

const REPO = "https://github.com/wp-support-lab/wordpress-support-toolkit";

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-90 h-0.5" aria-hidden>
      <div
        className="h-full transition-[width] duration-150"
        style={{ width: `${pct}%`, background: "linear-gradient(to right, var(--color-wp-blue), var(--color-wp-blue-dark))" }}
      />
    </div>
  );
}

function Toc({ article }: { article: Article }) {
  const [active, setActive] = useState<string>("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const heads = article.toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!heads.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: [0, 1] },
    );
    heads.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [article.slug, article.toc]);

  if (!article.toc.length) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24 w-full">
      <p className="eyebrow mb-3">On this page</p>
      <ul
        className="scrollbar-thin max-h-[58vh] space-y-0.5 overflow-y-auto border-l pr-2"
        style={{ borderColor: "var(--color-wp-border-light)" }}
      >
        {article.toc.map((t) => (
          <li key={t.id} className={cn(t.level === 3 && "pl-3")}>
            <a
              href={`#${t.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "-ml-px block border-l-2 py-1 pl-3 text-[12.5px] leading-5 transition",
                active === t.id
                  ? "border-[var(--color-wp-blue)] font-semibold text-[var(--color-wp-blue)]"
                  : "border-transparent text-[var(--color-wp-text-secondary)] hover:border-[var(--color-wp-border)] hover:text-[var(--color-wp-text)]",
              )}
            >
              {t.text}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-1 border-t pt-4 text-[12px]" style={{ borderColor: "var(--color-wp-border-light)" }}>
        <a
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-[var(--color-wp-blue-wash)] hover:text-[var(--color-wp-blue)]"
          style={{ color: "var(--color-wp-text-secondary)" }}
          href={`${REPO}/edit/main/content${article.slug}.mdx`}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Pencil className="h-3.5 w-3.5" /> Suggest an edit on GitHub
        </a>
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-[var(--color-wp-blue-wash)] hover:text-[var(--color-wp-blue)]"
          style={{ color: "var(--color-wp-text-secondary)" }}
          onClick={async () => {
            await navigator.clipboard?.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" style={{ color: "var(--color-wp-success)" }} /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? "Link copied" : "Copy article link"}
        </button>
        <Link
          to="/contribute"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-[var(--color-wp-blue-wash)] hover:text-[var(--color-wp-blue)]"
          style={{ color: "var(--color-wp-text-secondary)" } as React.CSSProperties}
        >
          <GitBranch className="h-3.5 w-3.5" /> Contribution guide
        </Link>
      </div>
    </nav>
  );
}

export function ArticleView({ article }: { article: Article }) {
  const section = SECTIONS.find((s) => s.id === article.section);
  const siblings = bySection(article.section);
  const idx = siblings.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx > -1 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  const rel = related(article, 4);

  const meta: { label: string; value: React.ReactNode }[] = [
    { label: "Difficulty", value: <DifficultyPip level={article.difficulty} /> },
    {
      label: "Time to fix",
      value: (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12.5px]">
          <Clock className="h-3.5 w-3.5" style={{ color: "var(--color-wp-text-muted)" }} /> {article.timeToFix}
        </span>
      ),
    },
    { label: "Impact", value: <SeverityBadge severity={article.severity} /> },
    { label: "Reading time", value: <span className="font-mono text-[12.5px]">{article.readMinutes} min</span> },
  ];

  return (
    <>
      <ReadingProgress />
      <div className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-wp-border-light)", backgroundColor: "var(--color-wp-white)" }}>
        <div className="glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 font-mono text-[11px]" style={{ color: "var(--color-wp-text-muted)" }}>
            <Link to="/" className="hover:text-[var(--color-wp-blue)]">home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/knowledge-base" className="hover:text-[var(--color-wp-blue)]">knowledge-base</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/category/${article.section}`} className="hover:text-[var(--color-wp-blue)]">{article.section}</Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: "var(--color-wp-text-secondary)" }}>{article.slug.split("/").pop()}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">
              <Icon name={section?.icon ?? "resources"} className="h-3.5 w-3.5" />
              {section?.title ?? article.section}
            </Badge>
            {article.featured && (
              <Badge tone="amber">
                <Star className="h-3 w-3" /> editor's pick
              </Badge>
            )}
            <span className="hidden font-mono text-[11px] sm:inline" style={{ color: "var(--color-wp-text-muted)" }}>
              {article.file.replace(/^.*\/content\//, "content/")}
            </span>
          </div>

          <h1
            className="text-balance mt-4 max-w-4xl text-[27px] font-bold leading-[1.12] tracking-tight sm:text-[38px]"
            style={{ color: "var(--color-wp-text)" }}
          >
            {article.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[15.5px] leading-7" style={{ color: "var(--color-wp-text-secondary)" }}>{article.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {meta.map((m) => (
              <div key={m.label} className="card px-3.5 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--color-wp-text-muted)" }}>{m.label}</dt>
                <dd className="mt-1.5 text-[13px] font-medium" style={{ color: "var(--color-wp-text)" }}>{m.value}</dd>
              </div>
            ))}
          </dl>

          {article.appliesTo.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="eyebrow">Applies to</span>
              {article.appliesTo.map((a) => (
                <span
                  key={a}
                  className="rounded-md border px-2 py-0.5 text-[11.5px]"
                  style={{ borderColor: "var(--color-wp-border-light)", backgroundColor: "var(--color-wp-white)", color: "var(--color-wp-text-secondary)" }}
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_248px]">
        <div className="min-w-0">
          <Markdown markdown={article.body} />

          <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-5" style={{ borderColor: "var(--color-wp-border-light)" }}>
            <span className="eyebrow">Tags</span>
            {article.tags.map((t) => (
              <Tag key={t} tag={t} />
            ))}
          </div>

          <div className="card mt-8 p-5 sm:p-6" style={{ backgroundColor: "var(--color-wp-blue-pale)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] font-semibold" style={{ color: "var(--color-wp-text)" }}>Did this article resolve your case?</p>
                <p className="mt-1 text-[13px] leading-6" style={{ color: "var(--color-wp-text-secondary)" }}>
                  Found a gap, an outdated step, or a better diagnostic? Every article is a single MDX file — send a PR.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={`${REPO}/edit/main/content${article.slug}.mdx`} target="_blank" rel="noreferrer noopener" className="btn-primary">
                  <Pencil className="h-3.5 w-3.5" /> Edit this page
                </a>
                <Link to="/contribute" className="btn-secondary">Contribute</Link>
              </div>
            </div>
            <p className="mt-4 font-mono text-[11px]" style={{ color: "var(--color-wp-text-muted)" }}>
              last updated {article.updated || "—"} · {article.words} words · reviewed by the WordPress Support Toolkit community
            </p>
          </div>

          {(prev || next) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link to={prev.slug} className="card card-hover p-4">
                  <span className="eyebrow inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> previous</span>
                  <p className="mt-1.5 text-[14px] font-semibold" style={{ color: "var(--color-wp-text)" }}>{prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={next.slug} className="card card-hover p-4 text-right">
                  <span className="eyebrow inline-flex items-center gap-1">next <ArrowRight className="h-3 w-3" /></span>
                  <p className="mt-1.5 text-[14px] font-semibold" style={{ color: "var(--color-wp-text)" }}>{next.title}</p>
                </Link>
              )}
            </div>
          )}

          {rel.length > 0 && (
            <section className="mt-12">
              <p className="eyebrow mb-2">keep investigating</p>
              <h2 className="mb-4 text-[20px] font-bold tracking-tight" style={{ color: "var(--color-wp-text)" }}>Related articles</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {rel.map((r) => (
                  <ArticleCard key={r.slug} article={r} compact />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <Toc article={article} />
        </aside>
      </div>
    </>
  );
}
