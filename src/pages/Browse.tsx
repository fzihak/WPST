import { useMemo, useState } from "react";
import { articles, bySection, allTags, isLive, search, sectionCount, type Article } from "@/lib/content";
import { Link, navigate, useRoute } from "@/lib/router";
import { SECTIONS } from "@/data/taxonomy";
import { ArticleCard } from "@/components/ArticleCard";
import { Badge, Card, Empty, PageHeader, SectionHeader, SeverityBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { cn } from "@/utils/cn";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

function Filters({
  query,
  setQuery,
  section,
  setSection,
  difficulty,
  setDifficulty,
  sort,
  setSort,
}: {
  query: string;
  setQuery: (v: string) => void;
  section: string;
  setSection: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by title, tag or content…"
        className="rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3 py-2 text-[13.5px] text-[var(--color-wp-text)] outline-none placeholder:text-[var(--color-wp-text-muted)] focus:border-brand-500/60"
      />
      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3 py-2 text-[13.5px] text-[var(--color-wp-text)] outline-none"
      >
        <option value="">All sections</option>
        {SECTIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} ({sectionCount(s.id)})
          </option>
        ))}
      </select>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3 py-2 text-[13.5px] text-[var(--color-wp-text)] outline-none"
      >
        <option value="">Any difficulty</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3 py-2 text-[13.5px] text-[var(--color-wp-text)] outline-none"
      >
        <option value="section">Sort: section</option>
        <option value="title">Sort: title</option>
        <option value="updated">Sort: last updated</option>
        <option value="time">Sort: quickest fix</option>
      </select>
    </div>
  );
}

export function KnowledgeBasePage() {
  const route = useRoute();
  const [query, setQuery] = useState(route.query.get("q") ?? "");
  const [section, setSection] = useState(route.query.get("section") ?? "");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("section");

  const results = useMemo(() => {
    let list: Article[] = query.trim().length > 1 ? search(query, 500).map((h) => h.article) : [...articles];
    if (section) list = list.filter((a) => a.section === section);
    if (difficulty) list = list.filter((a) => a.difficulty === difficulty);
    switch (sort) {
      case "title":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "updated":
        list = [...list].sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
        break;
      case "time":
        list = [...list].sort(
          (a, b) => (parseInt(a.timeToFix) || 99) - (parseInt(b.timeToFix) || 99) || a.title.localeCompare(b.title),
        );
        break;
      default:
        break;
    }
    return list;
  }, [query, section, difficulty, sort]);

  return (
    <>
      <PageHeader
        eyebrow="knowledge base"
        title="Browse everything"
        blurb="Full-text search across summaries, symptoms, investigation steps and resolutions. No backend, no tracking — the index ships with the site."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Filters
          query={query}
          setQuery={setQuery}
          section={section}
          setSection={setSection}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          sort={sort}
          setSort={setSort}
        />
        <p className="mt-4 font-mono text-[11.5px] text-[var(--color-wp-text-muted)]">
          {results.length} article{results.length === 1 ? "" : "s"}
          {query ? ` matching “${query}”` : ""}
          {section ? ` in ${section}/` : ""}
        </p>
        {results.length === 0 ? (
          <div className="mt-6">
            <Empty>
              No match. Try a shorter term, or{" "}
              <button className="text-[var(--color-wp-blue)] hover:underline" onClick={() => { setQuery(""); setSection(""); setDifficulty(""); }}>
                reset the filters
              </button>
              .
            </Empty>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function SearchPage() {
  const route = useRoute();
  const q = route.query.get("q") ?? "";
  const [term, setTerm] = useState(q);
  const hits = useMemo(() => (term.trim().length > 1 ? search(term, 60) : []), [term]);

  return (
    <>
      <PageHeader eyebrow="search" title={q ? `Results for “${q}”` : "Search the lab"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(term.trim())}`);
          }}
          className="flex max-w-xl items-center gap-2"
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="plugin, woocommerce, memory, ssl, redirect, elementor, fatal, ftp, database"
            className="w-full rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-500/60"
          />
          <button className="rounded-xl bg-[var(--color-wp-blue)] px-4 py-2.5 text-[13.5px] font-medium text-white hover:bg-[var(--color-wp-blue-dark)]">
            Search
          </button>
        </form>
      </PageHeader>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {hits.length === 0 ? (
          <Empty>
            {term.trim().length > 1 ? "Nothing matched." : "Enter at least two characters."} Try{" "}
            <Link to="/knowledge-base" className="text-[var(--color-wp-blue)] hover:underline">
              browsing all articles
            </Link>
            .
          </Empty>
        ) : (
          <ul className="space-y-3">
            {hits.map((h) => (
              <li key={h.article.slug}>
                <Link
                  to={h.article.slug}
                  className="block rounded-2xl border border-[var(--color-wp-border-light)] bg-white p-4 transition hover:border-brand-500/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand" className="font-mono text-[10.5px]">
                      {h.article.section}/
                    </Badge>
                    <span className="font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">score {h.score}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-semibold text-[var(--color-wp-text)]">{h.article.title}</p>
                  <p className="mt-1 text-[13px] leading-6 text-[var(--color-wp-text-secondary)]">{h.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="taxonomy"
        title="Categories"
        blurb="Every topic in the lab, grouped the same way as the content/ folder. Live topics link to articles; planned topics are queued — claim one and open a PR."
      />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        {SECTIONS.map((s) => {
          const live = bySection(s.id).length;
          return (
            <Card key={s.id} className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-wp-border-light)] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)]">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <Link to={`/category/${s.id}`} className="text-[15.5px] font-semibold text-[var(--color-wp-text)] hover:text-[var(--color-wp-blue)]">
                      {s.title}
                    </Link>
                    <p className="text-[12.5px] text-[var(--color-wp-text-secondary)]">{s.blurb}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="emerald">{live} live</Badge>
                  <Badge tone="amber">{s.topics.length - live} planned</Badge>
                  <Link
                    to={`/category/${s.id}`}
                    className="rounded-lg border border-[var(--color-wp-border-light)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-wp-text-secondary)] hover:border-brand-500/40"
                  >
                    {s.short}/ →
                  </Link>
                </div>
              </div>
              <ul className="grid gap-x-6 gap-y-1.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.topics.map((t) => {
                  const liveTopic = isLive(t.slug);
                  return (
                    <li key={t.slug} className="flex items-start gap-2 text-[13px]">
                      <span aria-hidden className={cn("mt-0.5 font-mono text-[11px]", liveTopic ? "text-emerald-500" : "text-[var(--color-wp-text-light)]")}>
                        {liveTopic ? "●" : "○"}
                      </span>
                      {liveTopic ? (
                        <Link to={t.slug} className="text-[var(--color-wp-text-secondary)] hover:text-[var(--color-wp-blue)]">
                          {t.label}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-wp-text-muted)]">
                          {t.label} <span className="font-mono text-[10px]">planned</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function CategoryPage({ id }: { id: string }) {
  const section = SECTIONS.find((s) => s.id === id);
  const list = bySection(id);
  if (!section) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <Empty>
          Unknown category “{id}”.{" "}
          <Link to="/categories" className="text-[var(--color-wp-blue)] hover:underline">
            See all categories
          </Link>
          .
        </Empty>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`category · ${section.short}/`}
        title={section.title}
        blurb={section.blurb}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="emerald">{list.length} live articles</Badge>
          <Badge tone="amber">{section.topics.length - list.length} planned</Badge>
          <Link
            to="/contribute"
            className="rounded-full border border-[var(--color-wp-border-light)] px-2.5 py-0.5 text-[11.5px] text-[var(--color-wp-text-secondary)] hover:border-brand-500/40"
          >
            claim a topic →
          </Link>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {list.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}

        <section className="mt-10">
          <SectionHeader eyebrow="topic map" title={`Everything in ${section.title}`}>
            Green topics are published. Hollow topics are queued in the content roadmap.
          </SectionHeader>
          <Card>
            <ul className="grid gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {section.topics.map((t) => {
                const liveTopic = isLive(t.slug);
                return (
                  <li key={t.slug} className="flex items-start gap-2 text-[13.5px]">
                    <span aria-hidden className={cn("mt-1 font-mono text-[10px]", liveTopic ? "text-emerald-500" : "text-[var(--color-wp-text-light)]")}>
                      {liveTopic ? "●" : "○"}
                    </span>
                    {liveTopic ? (
                      <Link to={t.slug} className="text-[var(--color-wp-text-secondary)] hover:text-[var(--color-wp-blue)]">
                        {t.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--color-wp-text-muted)]">{t.label}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section className="mt-10">
          <SectionHeader eyebrow="related sections" title="Keep going" />
          <div className="flex flex-wrap gap-2">
            {SECTIONS.filter((s) => s.id !== section.id)
              .slice(0, 10)
              .map((s) => (
                <Link
                  key={s.id}
                  to={`/category/${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-wp-border-light)] px-3 py-1.5 text-[12.5px] text-[var(--color-wp-text-secondary)] transition hover:border-brand-500/40 hover:text-[var(--color-wp-blue)]"
                >
                  <Icon name={s.icon} className="h-3.5 w-3.5" /> {s.title}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function ErrorIndexPage() {
  const errors = bySection("errors");
  const planned = SECTIONS.find((s) => s.id === "errors")!.topics.filter((t) => !isLive(t.slug));
  return (
    <>
      <PageHeader
        eyebrow="error dictionary"
        title="Error codes"
        blurb="One page per error. Same structure every time: symptoms, possible causes, prerequisites, investigation, diagnosis, resolution, verification, root cause, prevention, references."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card className="p-0">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-[var(--color-wp-border-light)] bg-[var(--color-wp-body)] text-[11px] uppercase tracking-wider text-[var(--color-wp-text-secondary)]">
                  <th className="px-4 py-2.5">Error</th>
                  <th className="px-4 py-2.5">Impact</th>
                  <th className="px-4 py-2.5">Difficulty</th>
                  <th className="px-4 py-2.5">Time to fix</th>
                  <th className="px-4 py-2.5">First investigation step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {errors.map((e) => (
                  <tr key={e.slug} className="hover:bg-[var(--color-wp-body)]/70">
                    <td className="px-4 py-3">
                      <Link to={e.slug} className="font-semibold text-[var(--color-wp-text)] hover:text-[var(--color-wp-blue)]">
                        {e.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={e.severity} />
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-wp-text-secondary)]">{e.difficulty}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-wp-text-secondary)]">{e.timeToFix}</td>
                    <td className="px-4 py-3 text-[var(--color-wp-text-secondary)]">
                      {(
                        e.body
                          .split("\n")
                          .find((l) => /^\d+\.\s/.test(l.trim()))
                          ?.replace(/^\d+\.\s*/, "")
                          .replace(/[*`]/g, "")
                          .split("—")[0]
                          .trim() ?? "—"
                      ).slice(0, 110)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {planned.length > 0 && (
          <section className="mt-8">
            <SectionHeader eyebrow="roadmap" title="Errors queued in the lab">
              Same template, one MDX file each — pick one up and contribute it.
            </SectionHeader>
            <div className="flex flex-wrap gap-2">
              {planned.map((p) => (
                <span
                  key={p.slug}
                  className="rounded-full border border-dashed border-[var(--color-wp-border)] px-3 py-1.5 text-[12.5px] text-[var(--color-wp-text-muted)]"
                >
                  {p.label}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export function TagsPage() {
  const tags = allTags();
  return (
    <>
      <PageHeader eyebrow="tags" title="Tags" blurb="Cross-section indexing: the same tags link errors, hosting, plugins and performance together." />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.tag}
              to={`/tag/${encodeURIComponent(t.tag)}`}
              className="group flex items-center gap-2 rounded-full border border-[var(--color-wp-border-light)] bg-white px-3 py-1.5 text-[13px] text-[var(--color-wp-text-secondary)] transition hover:border-brand-500/40 hover:text-[var(--color-wp-blue)]"
            >
              #{t.tag}
              <span className="rounded-full bg-[var(--color-wp-body)] px-1.5 font-mono text-[10px] text-[var(--color-wp-text-secondary)] group-hover:bg-[var(--color-wp-blue-wash)]">
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export function TagPage({ tag }: { tag: string }) {
  const list = articles.filter((a) => a.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="tag" title={`#${tag}`} blurb={`${list.length} article${list.length === 1 ? "" : "s"} tagged ${tag}.`} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {list.length === 0 ? (
          <Empty>
            No articles with that tag yet.{" "}
            <Link to="/tags" className="text-[var(--color-wp-blue)] hover:underline">
              See all tags
            </Link>
            .
          </Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}



