import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight, Search } from "lucide-react";
import { articles, bySection, latest, search, sectionCount, stats } from "@/lib/content";
import { Link, navigate } from "@/lib/router";
import { SECTIONS, SUPPORT_WORKFLOW, TOOLKIT } from "@/data/taxonomy";
import { ArticleCard } from "@/components/ArticleCard";
import { Icon } from "@/components/Icon";
import { SectionHeader, SeverityBadge, TimeChip } from "@/components/ui";
import heroImg from "@/assets/hero.png";

const HERO_CHIPS = ["500", "woocommerce", "memory", "ssl", "redirect", "elementor", "fatal", "ftp", "database"];

function Hero() {
  const [q, setQ] = useState("");
  const hits = useMemo(() => (q.trim().length > 1 ? search(q, 6) : []), [q]);

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-wp-border)] bg-gradient-to-b from-white via-[var(--color-wp-body)]/50 to-[var(--color-wp-body)]">
      <div className="glow pointer-events-none absolute inset-0" />
      <div className="grid-noise pointer-events-none absolute inset-0 text-[var(--color-wp-text)] opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Text & Search */}
          <div className="lg:col-span-7">
            <h1 className="text-balance text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--color-wp-text)] sm:text-[48px] xl:text-[56px]">
              WordPress Support Toolkit
            </h1>
            <p className="text-balance mt-3 text-[19px] font-semibold leading-snug tracking-tight text-[var(--color-wp-blue)] sm:text-[23px]">
              The Open Troubleshooting Standard for WordPress.
            </p>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-[var(--color-wp-text-secondary)] sm:text-[16px]">
              Built for technical support engineers, developers, agencies, and hosting teams. Every article starts with <span className="font-semibold text-[var(--color-wp-text)]">deterministic investigation</span> — symptoms, evidence, isolation, resolution, verification, and prevention.
            </p>

            <div className="relative mt-8 max-w-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (hits[0]) navigate(hits[0].article.slug);
                  else if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
                }}
                className="card flex items-center gap-2 rounded-2xl border border-[var(--color-wp-border)] p-2 shadow-xl shadow-blue-900/5 transition focus-within:border-[var(--color-wp-blue)] focus-within:ring-2 focus-within:ring-[var(--color-wp-blue)]/20"
              >
                <Search className="ml-3 h-4 w-4 shrink-0 text-[var(--color-wp-text-muted)]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search 500 errors, WSOD, timeouts, memory, WP-CLI…"
                  aria-label="Search the knowledge base"
                  className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] text-[var(--color-wp-text)] outline-none placeholder:text-[var(--color-wp-text-muted)]"
                />
                <button type="submit" className="btn-primary shrink-0 rounded-xl px-4 py-2">
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {q.trim().length > 1 && (
                <div className="card absolute inset-x-0 top-full z-40 mt-2 overflow-hidden p-1.5 shadow-2xl">
                  {hits.length === 0 ? (
                    <p className="px-3 py-3 text-[13.5px] text-[var(--color-wp-text-secondary)]">
                      Nothing yet for “{q}” — try <em>fatal</em>, <em>cache</em>, <em>mysql</em> or <em>email</em>.
                    </p>
                  ) : (
                    hits.map((h) => (
                      <button
                        key={h.article.slug}
                        onClick={() => navigate(h.article.slug)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--color-wp-body)]"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)]">
                          <Icon name={SECTIONS.find((s) => s.id === h.article.section)?.icon ?? "resources"} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[10.5px] uppercase tracking-wider text-[var(--color-wp-text-muted)]">{h.article.section}</span>
                          <span className="block truncate text-[14px] font-semibold text-[var(--color-wp-text)]">{h.article.title}</span>
                        </span>
                      </button>
                    ))
                  )}
                  <button
                    onClick={() => navigate(`/search?q=${encodeURIComponent(q.trim())}`)}
                    className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-[var(--color-wp-border-light)] px-3 py-2 font-mono text-[11.5px] text-[var(--color-wp-blue)] hover:bg-[var(--color-wp-body)]"
                  >
                    view all results for “{q}” <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1 text-[11px]">Popular:</span>
              {HERO_CHIPS.map((c) => (
                <Link
                  key={c}
                  to={`/search?q=${encodeURIComponent(c)}`}
                  className="rounded-lg border border-[var(--color-wp-border)] bg-white px-2.5 py-1 text-[12px] font-medium text-[var(--color-wp-text-secondary)] shadow-2xs transition hover:border-[var(--color-wp-blue)] hover:text-[var(--color-wp-blue)]"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Graphic */}
          <div className="flex items-center justify-center lg:col-span-5">
            <img
              src={heroImg}
              alt="WordPress Support Toolkit Incident Response"
              className="h-auto w-full max-w-lg object-contain select-none lg:max-w-none"
            />
          </div>
        </div>

        {/* Stats Row */}
        <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "Articles", v: stats.articles, suffix: "" },
            { k: "Sections", v: stats.sections, suffix: "" },
            { k: "Tags", v: stats.tags, suffix: "" },
            { k: "Words of procedure", v: Math.round(stats.words / 1000), suffix: "k" },
          ].map((s) => (
            <div key={s.k} className="card p-4 transition-all hover:border-[var(--color-wp-blue)]/40 hover:shadow-md">
              <dt className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-wp-text-muted)]">{s.k}</dt>
              <dd className="mt-1 text-[28px] font-bold tracking-tight text-[var(--color-wp-text)]">
                {s.v}{s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const POPULAR_SLUGS = [
  "/errors/500-internal-server-error",
  "/errors/white-screen-of-death",
  "/errors/allowed-memory-size-exhausted",
  "/errors/error-establishing-database-connection",
  "/errors/err-too-many-redirects",
  "/woocommerce/payment-failed",
  "/elementor/css-not-loading",
  "/plugins/plugin-conflict",
];

function ViewAll({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-wp-blue)] hover:underline">
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export function Home() {
  const popular = POPULAR_SLUGS.map((s) => articles.find((a) => a.slug === s)).filter(Boolean);
  const errors = bySection("errors");
  const newest = latest(6);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        <section aria-labelledby="popular-problems">
          <SectionHeader eyebrow="start here" title="Popular problems" action={<ViewAll to="/knowledge-base" label="All articles" />}>
            The tickets that arrive every single week at every WordPress agency and hosting desk.
          </SectionHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((a) => a && <ArticleCard key={a.slug} article={a} />)}
          </div>
        </section>

        <section aria-labelledby="categories">
          <SectionHeader eyebrow="the map" title="Categories" action={<ViewAll to="/categories" label="Full topic map" />}>
            Content sections mirror the folder structure of the repository. Every topic is either published or queued
            in the lab roadmap.
          </SectionHeader>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <Link key={s.id} to={`/category/${s.id}`} className="card card-hover group flex items-start gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)] transition group-hover:bg-[var(--color-wp-blue-wash)] group-hover:text-[var(--color-wp-blue)]">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[14.5px] font-semibold text-[var(--color-wp-text)]">{s.title}</span>
                    <span className="rounded-full bg-[var(--color-wp-body)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-wp-text-secondary)]">
                      {sectionCount(s.id)}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[12.5px] leading-5 text-[var(--color-wp-text-secondary)]">{s.blurb}</span>
                  <span className="mt-1.5 block font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">{s.topics.length} topics · {s.short}/</span>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-wp-text-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-wp-blue)]" />
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="latest">
          <SectionHeader eyebrow="fresh in the lab" title="Latest articles" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((a) => (
              <ArticleCard key={a.slug} article={a} compact />
            ))}
          </div>
        </section>

        <section aria-labelledby="common-errors">
          <SectionHeader eyebrow="error dictionary" title="Common errors" action={<ViewAll to="/errors" label="Error codes index" />}>
            Every error gets one page: symptoms → causes → investigation → diagnosis → resolution → verification → root
            cause → prevention.
          </SectionHeader>
          <div className="card overflow-hidden p-0">
            <ul className="divide-y divide-ink-100">
              {errors.map((e) => (
                <li key={e.slug}>
                  <Link to={e.slug} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--color-wp-body)] sm:px-5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-wp-error-light)] text-[var(--color-wp-error)]">
                      <Icon name="errors" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--color-wp-text)] group-hover:text-[var(--color-wp-blue)]">
                      {e.title}
                    </span>
                    <span className="hidden sm:block">
                      <SeverityBadge severity={e.severity} />
                    </span>
                    <span className="hidden md:block">
                      <TimeChip value={e.timeToFix} />
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--color-wp-text-light)] group-hover:text-[var(--color-wp-blue)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="workflow">
          <SectionHeader eyebrow="how support engineers actually work" title="Support workflow">
            Investigation first. Change one variable at a time. Always verify. Then write it down so the next engineer
            starts further ahead.
          </SectionHeader>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_WORKFLOW.map((s, i) => (
              <li key={s.step} className="card relative p-5">
                <span className="absolute right-4 top-4 font-mono text-[11px] text-[var(--color-wp-text-light)]">{s.step}</span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[14.5px] font-semibold text-[var(--color-wp-text)]">{s.title}</p>
                <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--color-wp-text-secondary)]">{s.detail}</p>
                {i < SUPPORT_WORKFLOW.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[var(--color-wp-text-light)] lg:block" />
                )}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="toolkit">
          <SectionHeader eyebrow="jump straight in" title="Toolkit" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TOOLKIT.map((t) => (
              <Link key={t.to} to={t.to} className="card card-hover group p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)] transition group-hover:bg-[var(--color-wp-blue-wash)] group-hover:text-[var(--color-wp-blue)]">
                  <Icon name={t.icon} className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-[var(--color-wp-text)]">{t.name}</p>
                <p className="mt-0.5 text-[12.5px] text-[var(--color-wp-text-secondary)]">{t.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-wp-border-light)] bg-[var(--color-wp-dark)] p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_10%_0%,rgba(79,124,247,.35),transparent_60%),radial-gradient(500px_260px_at_100%_100%,rgba(139,92,246,.3),transparent_60%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow text-[var(--color-wp-blue-light)]">contribute</p>
              <h2 className="text-balance mt-2 text-[24px] font-semibold tracking-tight sm:text-[30px]">
                One article = one MDX file + one pull request
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-7 text-[var(--color-wp-text-light)]">
                Everything lives in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-white">content/&lt;section&gt;/&lt;slug&gt;.mdx</code>.
                Nothing else. Push it and the static site rebuilds and deploys. Consistency over cleverness: every
                article uses the same 13 sections so an engineer can skim any page in seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to="/contribute" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[var(--color-wp-text)] transition hover:bg-brand-300">
                  Read the contribution guide <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-white/10">
                  Repository structure
                </Link>
              </div>
            </div>
            <pre className="scrollbar-thin overflow-x-auto rounded-2xl border border-white/10 bg-[var(--color-wp-dark)]/80 p-5 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
{`content/
├── errors/500-internal-server-error.mdx
├── woocommerce/payment-failed.mdx
├── elementor/css-not-loading.mdx
├── php/memory-limit.mdx
└── security/file-permissions.mdx

git push  →  build  →  deploy`}
            </pre>
          </div>
        </section>
      </div>
    </>
  );
}



