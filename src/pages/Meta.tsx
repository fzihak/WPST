import { useMemo, useState } from "react";
import { latest, search, stats } from "@/lib/content";
import { CHECKLISTS } from "@/data/checklists";
import { RUNBOOKS } from "@/data/runbooks";
import { DECISION_TREES } from "@/data/decisionTrees";
import { Link, navigate } from "@/lib/router";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { Icon } from "@/components/Icon";
import { Badge, Card, PageHeader, SectionHeader } from "@/components/ui";

/* ── Support dashboard ─────────────────────────────────────────── */

const INTAKE_FIELDS = [
  { id: "customer", label: "Customer / account", placeholder: "Acme GmbH (agency)" },
  { id: "site", label: "Site URL", placeholder: "https://shop.example.com" },
  { id: "issue", label: "Issue in one sentence", placeholder: "Checkout returns 'payment failed' for all customers" },
  { id: "since", label: "Since when (UTC)", placeholder: "2026-01-18 09:12" },
  { id: "affected", label: "Who is affected", placeholder: "All customers, all browsers" },
  { id: "repro", label: "Reproduction steps", placeholder: "Add product → checkout → choose card → Place order" },
  { id: "recent", label: "Recent changes", placeholder: "WooCommerce 9.x update + new security plugin" },
  { id: "access", label: "Access available", placeholder: "wp-admin admin, cPanel, SSH read-only" },
];

function IntakeTool() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => {
    const v = (k: string) => values[k]?.trim() || "—";
    return [
      `## Ticket intake`,
      ``,
      `**Customer:** ${v("customer")}`,
      `**Site:** ${v("site")}`,
      `**Issue:** ${v("issue")}`,
      `**First seen:** ${v("since")} (UTC)`,
      `**Impact:** ${v("affected")}`,
      ``,
      `### Reproduction`,
      v("repro"),
      ``,
      `### Change history`,
      v("recent"),
      ``,
      `### Access`,
      v("access"),
      ``,
      `### Evidence collected`,
      `- [ ] curl status + headers (homepage, wp-login, affected URL)`,
      `- [ ] PHP error log window around first seen`,
      `- [ ] debug.log with WP_DEBUG_LOG (staging or webroot-safe path)`,
      `- [ ] Browser console + network response for the failing request`,
      `- [ ] WooCommerce System Status Report (if store)`,
      `- [ ] Query Monitor snapshot of slow queries / HTTP API`,
      ``,
      `### Hypothesis`,
      `1. `,
      ``,
      `### Next update to customer`,
      `—`,
    ].join("\n");
  }, [values]);

  return (
    <Card>
      <p className="text-[14px] font-semibold text-[var(--color-wp-text)]">Ticket intake builder</p>
      <p className="mt-1 text-[13px] text-[var(--color-wp-text-secondary)]">
        Fill the fields you already know and paste the generated brief into the ticket. Missing evidence stays visible as
        a checklist instead of being forgotten.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {INTAKE_FIELDS.map((f) => (
          <label key={f.id} className="block text-[12px] text-[var(--color-wp-text-secondary)]">
            {f.label}
            <input
              value={values[f.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-lg border border-[var(--color-wp-border-light)] bg-white px-3 py-2 text-[13.5px] text-[var(--color-wp-text)] outline-none focus:border-brand-500/60"
            />
          </label>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)]">
          <div className="flex items-center justify-between border-b border-[var(--color-wp-dark-mid)] px-3.5 py-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-wp-text-muted)]">ticket brief</span>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(markdown);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/80 hover:bg-white/20 hover:text-white"
            >
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <pre className="scrollbar-thin max-h-[360px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
            {markdown}
          </pre>
        </div>
        <div className="space-y-4">
          <Card className="bg-brand-500/5">
            <p className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--color-wp-blue)]">
              first 5 commands on any incident
            </p>
            <pre className="scrollbar-thin mt-2 overflow-auto font-mono text-[12.5px] leading-6 text-[var(--color-wp-text-secondary)]">
{`curl -sS -o /dev/null -w '%{http_code} %{time_total}s\\n' https://SITE/?nocache=1
dig +short SITE A
tail -n 120 ~/logs/php_error.log
wp plugin status --path=~/public_html
wp db check --path=~/public_html`}
            </pre>
            <button
              onClick={() =>
                navigator.clipboard?.writeText(
                  `curl -sS -o /dev/null -w '%{http_code} %{time_total}s\\n' https://SITE/?nocache=1\ndig +short SITE A\ntail -n 120 ~/logs/php_error.log\nwp plugin status --path=~/public_html\nwp db check --path=~/public_html`,
                )
              }
              className="mt-3 rounded-lg border border-[var(--color-wp-border-light)] px-2.5 py-1 font-mono text-[11px] text-[var(--color-wp-text-secondary)] hover:border-brand-500/40"
            >
              copy commands
            </button>
          </Card>
          <Card>
            <p className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--color-wp-text-muted)]">golden rules</p>
            <ul className="mt-2 space-y-2 text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">
              <li>• Change one variable at a time and write it down.</li>
              <li>• Evidence before action: log, status code, timestamp.</li>
              <li>• Never ask a customer for card data.</li>
              <li>• Snapshot database + files before repairs or malware work.</li>
              <li>• Stabilise first for P1s, root-cause immediately after.</li>
              <li>• Close the loop: prevention + KB entry belong in the ticket.</li>
            </ul>
          </Card>
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const [q, setQ] = useState("");
  const hits = q.trim().length > 1 ? search(q, 6) : [];

  return (
    <>
      <PageHeader
        eyebrow="support desk"
        title="Support dashboard"
        blurb={`${stats.articles} articles, ${RUNBOOKS.length} runbooks, ${DECISION_TREES.length} decision trees and ${CHECKLISTS.length} checklists — the working surface for a support shift.`}
      >
        <div className="relative max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What is the customer reporting? (500, no emails, slow, no access…)"
            className="w-full rounded-xl border border-[var(--color-wp-border-light)] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-500/60"
          />
          {hits.length > 0 && (
            <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-[var(--color-wp-border-light)] bg-white shadow-xl">
              {hits.map((h) => (
                <button
                  key={h.article.slug}
                  onClick={() => navigate(h.article.slug)}
                  className="block w-full px-3.5 py-2.5 text-left transition hover:bg-[var(--color-wp-body)]"
                >
                  <span className="font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">{h.article.slug}</span>
                  <span className="block text-[13.5px] font-semibold text-[var(--color-wp-text)]">
                    {h.article.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section>
          <SectionHeader eyebrow="triage" title="Live incident? Start with a runbook" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RUNBOOKS.map((r) => (
              <Link
                key={r.id}
                to={`/runbooks/${r.id}`}
                className="rounded-2xl border border-[var(--color-wp-border-light)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-wp-error-light)] text-[var(--color-wp-error)]">
                    <Icon name={r.id} className="h-4 w-4" />
                  </span>
                  <Badge tone={r.severity.startsWith("P1") ? "rose" : r.severity.startsWith("P2") ? "amber" : "sky"}>
                    {r.severity}
                  </Badge>
                </div>
                <p className="mt-3 text-[14.5px] font-semibold text-[var(--color-wp-text)]">{r.title}</p>
                <p className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-wp-text-muted)]">
                  {r.steps.length} steps · open <ArrowRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="narrow it down" title="Decision trees" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DECISION_TREES.map((t) => (
              <Link
                key={t.id}
                to={`/decision-trees/${t.id}`}
                className="rounded-2xl border border-[var(--color-wp-border-light)] bg-white p-4 transition hover:border-brand-500/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]">
                  <Icon name={t.id} className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-[var(--color-wp-text)]">{t.title}</p>
                <p className="mt-1 text-[12.5px] text-[var(--color-wp-text-secondary)]">{t.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="paperwork" title="Intake & evidence" />
          <IntakeTool />
        </section>

        <section>
          <SectionHeader
            eyebrow="shift prep"
            title="Checklists"
            action={
              <Link to="/checklists" className="text-[13px] font-medium text-[var(--color-wp-blue)] hover:underline">
                All checklists
              </Link>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHECKLISTS.map((c) => (
              <Link
                key={c.id}
                to={`/checklists/${c.id}`}
                className="rounded-2xl border border-[var(--color-wp-border-light)] bg-white p-4 transition hover:border-brand-500/40"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Icon name={c.icon} className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[14px] font-semibold text-[var(--color-wp-text)]">{c.title}</p>
                <p className="mt-1 font-mono text-[11px] text-[var(--color-wp-text-muted)]">
                  {c.groups.reduce((n, g) => n + g.items.length, 0)} checks · {c.when}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="recent" title="Latest updated articles" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {latest(6).map((a) => (
              <ArticleCard key={a.slug} article={a} compact />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* ── Contribute ────────────────────────────────────────────────── */

const ARTICLE_TEMPLATE = `---
title: "500 Internal Server Error"
description: "One-sentence summary used in search results and cards."
difficulty: Intermediate      # Beginner | Intermediate | Advanced | Expert
timeToFix: "15–45 min"
appliesTo: [WordPress Core, Hosting, PHP]
tags: [php, fatal-error, hosting, logs]
severity: Critical            # Low | Medium | High | Critical
updated: 2026-01-18
featured: true                # optional, shows in Popular Problems
---

## Symptoms

- What the user sees, verbatim (error page, status code, when it started).
- What still works — this is the most useful line in any ticket.

## Possible Causes

1. Ordered by how often they are the real cause.
2. Include the "looks similar but is not" case.

## Prerequisites

- Access needed (SSH / FTP / panel / admin).
- Backup and staging requirements before you touch anything.

## Investigation

1. **Confirm the symptom** — exact request, status, headers.
2. **Collect evidence** — logs, timestamps, versions.

\`\`\`bash
tail -n 120 ~/logs/php_error.log
\`\`\`

::: investigate
Investigation mindset: state what you are proving with each step. Never jump to a fix.
:::

## Diagnosis

| Evidence | Likely cause | Next test |
| --- | --- | --- |
| Fatal in plugin X | Version regression | Roll back one version |

## Resolution

1. Step-by-step fix, one change at a time.
2. Include the revert/rollback path.

## Verification

- How to prove it is fixed as a logged-out user.
- What should disappear from the logs.

## Root Cause

- The actual mechanism, not the symptom.

## Prevention

- Monitoring, limits, update policy, tests, documentation.

## Related Articles

- [/errors/white-screen-of-death](/errors/white-screen-of-death)

## Official References

- [Upstream docs](https://example.com) — what it confirms.
`;

export function ContributePage() {
  return (
    <>
      <PageHeader
        eyebrow="contributing"
        title="Contribute to the lab"
        blurb="One article = one MDX file + one pull request. If you have solved a ticket that is not documented here yet, that ticket is the article."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { t: "1 · Claim the topic", d: "Find a planned topic in the category pages. Comment on the issue so nobody writes the same article twice." },
            { t: "2 · Write the MDX", d: "Create content/<section>/<slug>.mdx with the frontmatter and 13 sections from the template below." },
            { t: "3 · Open a PR", d: "One article per PR, with the ticket type and logs redacted. A maintainer reviews for accuracy and consistency." },
          ].map((s) => (
            <Card key={s.t}>
              <p className="text-[14.5px] font-semibold text-[var(--color-wp-text)]">{s.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">{s.d}</p>
            </Card>
          ))}
        </section>

        <section>
          <SectionHeader eyebrow="structure" title="Repository & content layout">
            Every article lives in <code className="font-mono text-[12.5px]">content/</code>; nothing else is required.
            The build parses frontmatter, generates the table of contents, cross-links by tag and deploys statically.
          </SectionHeader>
          <div className="overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm">
            <pre className="scrollbar-thin overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
{`wordpress-support-toolkit/
├── content/
│   ├── errors/            # 500, WSOD, memory, redirects, SSL, 5xx…
│   ├── wordpress/         # updates, recovery mode, cron, permalinks
│   ├── plugins/           # conflicts, fatals, activation, auto-updates
│   ├── themes/            # broken layout, child themes, template hierarchy
│   ├── woocommerce/       # payments, checkout, emails, sessions, taxes
│   ├── elementor/         # safe mode, CSS, containers, responsive
│   ├── lms/               # Tutor, LearnDash, LifterLMS, MasterStudy
│   ├── mysql/             # repair, connection refused, search-replace
│   ├── hosting/           # cPanel, FTP, DNS, SSL, cron, PHP version
│   ├── php/               # memory, fatals, OPcache, upload limits
│   ├── apache/  nginx/    # .htaccess, rewrites, fastcgi timeouts
│   ├── performance/       # caching, TTFB, CWV, Query Monitor, object cache
│   ├── security/          # malware, permissions, brute force, backups
│   ├── migration/         # full-site moves, staging → production
│   ├── deployment/        # Git workflow, CI checks
│   ├── runbooks/          # numbered incident response
│   ├── checklists/        # pre-launch, security, performance, incident
│   └── decision-trees/    # interactive triage
├── src/                   # routes, search index, taxonomy, renderer
├── public/                # static assets only
├── docs/                  # style guide + review process
└── README.md
`}
            </pre>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="template" title="The article template (copy this)">
            Consistency is the product. Same sections, same order, every single article — so a support engineer can skim
            any page in seconds and know exactly where the investigation lives.
          </SectionHeader>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)]">
            <div className="flex items-center justify-between border-b border-[var(--color-wp-dark-mid)] px-3.5 py-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-wp-text-muted)]">
                content/errors/500-internal-server-error.mdx
              </span>
              <button
                onClick={() => navigator.clipboard?.writeText(ARTICLE_TEMPLATE)}
                className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/80 hover:bg-white/20 hover:text-white"
              >
                copy template
              </button>
            </div>
            <pre className="scrollbar-thin max-h-[520px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
              {ARTICLE_TEMPLATE}
            </pre>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-[14.5px] font-semibold text-[var(--color-wp-text)]">House rules</p>
            <ul className="mt-2 space-y-2 text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">
              <li>• Investigation before resolution. Show the reader how you would prove the cause.</li>
              <li>• No blind "install this plugin and hope". Explain what a step rules in or out.</li>
              <li>• Redact logs: no customer domains, tokens, emails or card data.</li>
              <li>• Cite official docs only (see Resources). Link, never copy large passages.</li>
              <li>• Add the version numbers the article was verified against in <em>appliesTo</em>.</li>
              <li>• US spelling for titles, sentence case, backticks for commands and file paths.</li>
            </ul>
          </Card>
          <Card>
            <p className="text-[14.5px] font-semibold text-[var(--color-wp-text)]">PR checklist</p>
            <ul className="mt-2 space-y-2 text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">
              <li>• File path matches the URL you want (e.g. <code>/errors/500-internal-server-error</code>).</li>
              <li>• Frontmatter complete: title, description, difficulty, timeToFix, appliesTo, tags, severity, updated.</li>
              <li>• All 13 sections present, in order, even if a section says "None — this error has a single cause".</li>
              <li>• At least one command or concrete check per investigation step.</li>
              <li>• Related articles actually exist (the build warns on broken internal links).</li>
              <li>• Spell-checked, and the fix verified on a real site.</li>
            </ul>
          </Card>
        </section>

        <section>
          <SectionHeader eyebrow="automation" title="GitHub Actions: lint the content on every PR">
            Checksums, frontmatter validation and dead-link scanning run before review, so reviewers argue about
            accuracy — not formatting.
          </SectionHeader>
          <div className="overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm">
            <pre className="scrollbar-thin overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
{`# .github/workflows/content.yml
name: content
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run content:lint      # frontmatter + section order + slug rules
      - run: npm run content:links     # internal link checker
      - run: npm run build             # static build must succeed
`}
            </pre>
          </div>
        </section>
      </div>
    </>
  );
}

/* ── How it works ──────────────────────────────────────────────── */

export function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="architecture"
        title="How the lab works"
        blurb="Content-first, zero-backend, insanely fast. Markdown in a Git repository, a static build out, and search that ships with the page."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Content as the only interface",
              d: "Authors write MDX. There is no CMS, no database, no login. A pull request is the publishing workflow — review, diff, history and revert for free.",
            },
            {
              t: "Static by default",
              d: "Every page is pre-rendered HTML with a handful of kilobytes of JS for search, theme and interactive triage. Nothing to patch, nothing to scale.",
            },
            {
              t: "Investigation-first structure",
              d: "The renderer enforces the same 13 sections on every article, generates the table of contents, spec card and related links from frontmatter and tags.",
            },
          ].map((c) => (
            <Card key={c.t}>
              <p className="text-[14.5px] font-semibold text-[var(--color-wp-text)]">{c.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">{c.d}</p>
            </Card>
          ))}
        </section>

        <section>
          <SectionHeader eyebrow="pipeline" title="Push to deploy" />
          <div className="overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm">
            <pre className="scrollbar-thin overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">
{`author writes content/<section>/<slug>.mdx
        │
        ▼
pull request ──► GitHub Actions
                 ├── content:lint   (frontmatter, section order, slug rules)
                 ├── content:links  (internal + official reference links)
                 └── build          (static output must compile)
        │
        ▼
merge to main ──► Vercel build ──► static HTML per route + search index
        │
        ▼
live in seconds: /errors/500 → /plugins/plugin-conflict → /runbooks/site-down`}
            </pre>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="routes" title="SEO-friendly URL map">
            Slugs are derived from the file path, so the URL a support engineer pastes into a ticket is predictable and
            stable: they can guess it, and they get the right article.
          </SectionHeader>
          <Card className="p-0">
            <ul className="divide-y divide-ink-100 font-mono text-[12.5px]">
              {[
                "/wordpress/update-failed",
                "/errors/500-internal-server-error",
                "/errors/error-establishing-database-connection",
                "/plugins/plugin-conflict",
                "/themes/broken-layout",
                "/hosting/cpanel",
                "/php/memory-limit",
                "/mysql/database-repair",
                "/woocommerce/payment-failed",
                "/elementor/css-not-loading",
                "/security/file-permissions",
                "/performance/object-cache",
                "/runbooks/site-down",
                "/checklists/pre-launch",
                "/decision-trees/website-down",
              ].map((r) => (
                <li key={r} className="px-4 py-2">
                  <Link to={r} className="text-[var(--color-wp-text-secondary)] hover:text-[var(--color-wp-blue)]">
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section>
          <SectionHeader eyebrow="roadmap" title="Where the lab is going" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Fill the planned topics in every category (each is a single MDX file).",
              "Versioned articles: pin behaviour notes per WordPress / PHP / WooCommerce release.",
              "Snippet library: copyable WP-CLI and SQL recipes with expected output.",
              "Watchdog log library: what healthy logs look like, so anomalies stand out.",
              "Decision-tree builder so contributors can add trees by editing data, not code.",
              "Anti-patterns collection: fixes that cause the next incident.",
            ].map((r) => (
              <Card key={r} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <p className="text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">{r}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}



