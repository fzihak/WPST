import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, RotateCcw, TriangleAlert } from "lucide-react";
import { CHECKLISTS, type Checklist } from "@/data/checklists";
import { RUNBOOKS } from "@/data/runbooks";
import { DECISION_TREES, type DecisionTree } from "@/data/decisionTrees";
import { Link, useRoute } from "@/lib/router";
import { Icon } from "@/components/Icon";
import { CopyBtn } from "@/pages/Library";
import { Badge, Card, PageHeader, SectionHeader } from "@/components/ui";
import { cn } from "@/utils/cn";

function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="rounded border border-[var(--color-wp-border-light)] bg-[var(--color-wp-body)] px-1 font-mono text-[12px] text-[var(--color-wp-text)]">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

function SideNav<T extends { id: string; title: string }>({
  items,
  activeId,
  base,
  iconFor,
  meta,
}: {
  items: T[];
  activeId: string;
  base: string;
  iconFor: (item: T) => string;
  meta: (item: T) => string;
}) {
  return (
    <nav className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
      {items.map((c) => (
        <Link
          key={c.id}
          to={`${base}/${c.id}`}
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 transition lg:shrink",
            c.id === activeId
              ? "border-brand-500/40 bg-brand-500/5"
              : "border-[var(--color-wp-border-light)] bg-white hover:border-brand-500/30",
          )}
        >
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", c.id === activeId ? "bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]" : "bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)]")}>
            <Icon name={iconFor(c)} className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[13.5px] font-semibold text-[var(--color-wp-text)] lg:whitespace-normal">{c.title}</span>
            <span className="block whitespace-nowrap font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">{meta(c)}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}

/* ── Checklists ────────────────────────────────────────────────── */

function checklistToMarkdown(cl: Checklist, checked: Record<string, boolean>) {
  const lines = [`# ${cl.title}`, ``, `> ${cl.blurb}`, ``];
  cl.groups.forEach((g, gi) => {
    lines.push(`## ${g.group}`);
    g.items.forEach((it, ii) => lines.push(`- [${checked[`${gi}:${ii}`] ? "x" : " "}] ${it.text}`));
    lines.push("");
  });
  return lines.join("\n");
}

export function ChecklistsPage({ id }: { id?: string }) {
  const active = CHECKLISTS.find((c) => c.id === id) ?? CHECKLISTS[0];
  const storageKey = `wpsl:checklist:${active.id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setChecked(JSON.parse(localStorage.getItem(storageKey) ?? "{}"));
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const toggle = (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const total = active.groups.reduce((n, g) => n + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="checklists" title="Checklists" blurb="Copy-ready operational checklists. Progress is stored locally in your browser — nothing is sent anywhere." />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">
        <SideNav items={CHECKLISTS} activeId={active.id} base="/checklists" iconFor={(c) => c.icon} meta={(c) => `${c.min} checks · ${c.when}`} />

        <div className="min-w-0">
          <div className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]">
                  <Icon name={active.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-[20px] font-semibold tracking-tight text-[var(--color-wp-text)]">{active.title}</h2>
                  <p className="mt-1 max-w-2xl text-[13.5px] leading-6 text-[var(--color-wp-text-secondary)]">{active.blurb}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <CopyBtn value={checklistToMarkdown(active, checked)} label="copy as markdown" />
                <button
                  onClick={() => {
                    setChecked({});
                    localStorage.removeItem(storageKey);
                  }}
                  className="btn-ghost hover:border-rose-400/50 hover:text-rose-500"
                >
                  <RotateCcw className="h-3 w-3" /> reset
                </button>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-wp-body)]">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-[11.5px] text-[var(--color-wp-text-secondary)]">
                {done}/{total} · {pct}%
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-7">
            {active.groups.map((g, gi) => (
              <section key={g.group}>
                <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-wp-text-secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {g.group}
                </h3>
                <ul className="space-y-1.5">
                  {g.items.map((it, ii) => {
                    const key = `${gi}:${ii}`;
                    const isDone = Boolean(checked[key]);
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggle(key)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                            isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-[var(--color-wp-border-light)] bg-white hover:border-brand-500/30",
                          )}
                          aria-pressed={isDone}
                        >
                          <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition", isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--color-wp-border)]")}>
                            {isDone && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0">
                            <RichText text={it.text} className={cn("text-[14px] leading-6", isDone ? "text-[var(--color-wp-text-muted)] line-through" : "text-[var(--color-wp-text-secondary)]")} />
                            {it.hint && <span className="mt-0.5 block text-[12px] text-[var(--color-wp-text-muted)]">{it.hint}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Runbooks ──────────────────────────────────────────────────── */

const sevTone = (s: string): "rose" | "amber" | "sky" => (s.startsWith("P1") ? "rose" : s.startsWith("P2") ? "amber" : "sky");

export function RunbooksPage({ id }: { id?: string }) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({ "0": true });
  const active = RUNBOOKS.find((r) => r.id === id);
  const route = useRoute();

  useEffect(() => {
    setOpenSteps({ "0": true });
  }, [route.path]);

  if (!active) {
    return (
      <>
        <PageHeader eyebrow="runbooks" title="Runbooks" blurb="Timeboxed, numbered incident response. Pick the incident you are living through right now." />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {RUNBOOKS.map((r) => (
              <Link key={r.id} to={`/runbooks/${r.id}`} className="card card-hover group p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-wp-error-light)] text-[var(--color-wp-error)]">
                    <Icon name={r.id} className="h-5 w-5" />
                  </span>
                  <Badge tone={sevTone(r.severity)}>{r.severity}</Badge>
                  <span className="ml-auto font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">{r.steps.length} steps</span>
                </div>
                <h2 className="mt-4 text-[17px] font-semibold text-[var(--color-wp-text)] group-hover:text-[var(--color-wp-blue)]">{r.title}</h2>
                <p className="mt-1 text-[13px] leading-6 text-[var(--color-wp-text-secondary)]">{r.blurb}</p>
                <p className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-wp-blue)]">
                  open runbook <ArrowRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }

  const md = [
    `# ${active.title} runbook`,
    "",
    `**Severity:** ${active.severity}`,
    `**Trigger:** ${active.trigger}`,
    `**First response:** ${active.firstResponse}`,
    "",
    ...active.steps.flatMap((s, i) => {
      const lines = [`## ${i + 1}. ${s.title} (${s.timebox})`, "", s.detail, ""];
      if (s.commands?.length) lines.push("```bash", ...s.commands, "```", "");
      if (s.lookFor) lines.push(`Look for: ${s.lookFor}`, "");
      return lines;
    }),
    "## Escalate when",
    ...active.escalateWhen.map((e) => `- ${e}`),
  ].join("\n");

  return (
    <>
      <PageHeader eyebrow={`runbook · ${active.severity}`} title={active.title} blurb={active.blurb}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={sevTone(active.severity)}>
            <TriangleAlert className="h-3 w-3" /> {active.trigger}
          </Badge>
          <CopyBtn value={md} label="copy runbook as markdown" />
          <Link to="/runbooks" className="btn-ghost">
            <ArrowLeft className="h-3 w-3" /> all runbooks
          </Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Card className="border-amber-500/40 bg-amber-500/5">
          <p className="eyebrow text-amber-600">first response</p>
          <p className="mt-1.5 text-[14.5px] leading-7 text-[var(--color-wp-text-secondary)]">{active.firstResponse}</p>
        </Card>

        <ol className="mt-6 space-y-3">
          {active.steps.map((s, i) => {
            const open = openSteps[String(i)] ?? false;
            return (
              <li key={s.title}>
                <div className="card overflow-hidden p-0">
                  <button onClick={() => setOpenSteps((o) => ({ ...o, [String(i)]: !open }))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left" aria-expanded={open}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-wp-blue-wash)] font-mono text-[12px] font-semibold text-[var(--color-wp-blue)]">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-[var(--color-wp-text)]">{s.title}</span>
                      <span className="font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">timebox {s.timebox}</span>
                    </span>
                    {open ? <ChevronUp className="h-4 w-4 text-[var(--color-wp-text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-wp-text-muted)]" />}
                  </button>
                  {open && (
                    <div className="border-t border-[var(--color-wp-border-light)] px-4 py-4">
                      <p className="text-[14px] leading-7 text-[var(--color-wp-text-secondary)]">{s.detail}</p>
                      {s.commands && s.commands.length > 0 && (
                        <figure className="mt-3 overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm">
                          <figcaption className="flex items-center justify-between border-b border-[var(--color-wp-dark-mid)] bg-[#191e23] px-3.5 py-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1.5" aria-hidden>
                                <span className="h-2 w-2 rounded-full bg-[#ff5f56]/80" />
                                <span className="h-2 w-2 rounded-full bg-[#ffbd2e]/80" />
                                <span className="h-2 w-2 rounded-full bg-[#27c93f]/80" />
                              </span>
                              <span className="font-mono text-[10.5px] uppercase tracking-widest text-[#a7aaad]">shell</span>
                            </div>
                            <CopyBtn value={s.commands.join("\n")} className="border-white/15 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white" />
                          </figcaption>
                          <pre className="scrollbar-thin overflow-x-auto p-3.5 font-mono text-[12.5px] leading-6 text-[#f0f0f1]">{s.commands.join("\n")}</pre>
                        </figure>
                      )}
                      {s.lookFor && (
                        <p className="mt-3 rounded-lg border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-[13.5px] text-[var(--color-wp-text-secondary)]">
                          <span className="font-semibold">Look for: </span>
                          {s.lookFor}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <section className="mt-10">
          <SectionHeader eyebrow="hand-off" title="Escalate when" />
          <Card>
            <ul className="space-y-2.5 text-[14px] leading-6 text-[var(--color-wp-text-secondary)]">
              {active.escalateWhen.map((e) => (
                <li key={e} className="flex gap-2.5">
                  <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                  {e}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mt-10">
          <SectionHeader eyebrow="keep reading" title="Related articles" />
          <div className="flex flex-wrap gap-2">
            {active.related.map((r) => (
              <Link key={r} to={r} className="btn-ghost">
                {r}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* ── Decision trees ────────────────────────────────────────────── */

function TreeWalker({ tree }: { tree: DecisionTree }) {
  const [path, setPath] = useState<string[]>([tree.start]);
  const [picked, setPicked] = useState<string[]>([]);
  const current = path[path.length - 1];
  const node = tree.nodes.find((n) => n.id === current);
  const outcome = current.startsWith("o:") ? tree.outcomes[current.slice(2)] : undefined;

  const reset = () => {
    setPath([tree.start]);
    setPicked([]);
  };
  const choose = (option: { label: string; go: string }) => {
    setPicked((p) => [...p, option.label]);
    setPath((prev) => [...prev, option.go]);
  };
  const back = () => {
    if (path.length <= 1) return;
    setPath((prev) => prev.slice(0, -1));
    setPicked((prev) => prev.slice(0, -1));
  };

  const tone = outcome
    ? outcome.severity === "bad"
      ? "border-rose-500/40 bg-rose-500/5"
      : outcome.severity === "warn"
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-emerald-500/40 bg-emerald-500/5"
    : "";

  return (
    <div>
      {picked.length > 0 && (
        <ol className="mb-4 space-y-1.5">
          {picked.map((p, i) => (
            <li key={`${p}-${i}`} className="flex items-center gap-2 font-mono text-[11.5px] text-[var(--color-wp-text-muted)]">
              <span className="grid h-5 w-5 place-items-center rounded bg-[var(--color-wp-body)] text-[10px]">{i + 1}</span>
              <ArrowRight className="h-3 w-3" /> {p}
            </li>
          ))}
        </ol>
      )}

      {node && (
        <Card className="p-5 sm:p-6">
          <p className="eyebrow">node {path.length} · question</p>
          <h3 className="text-balance mt-2 text-[19px] font-semibold text-[var(--color-wp-text)]">{node.question}</h3>
          {node.hint && <p className="mt-1 text-[13px] text-[var(--color-wp-text-secondary)]">{node.hint}</p>}
          <div className="mt-5 grid gap-2">
            {node.options.map((o) => (
              <button
                key={o.label}
                onClick={() => choose(o)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-wp-border-light)] px-4 py-3 text-left text-[14px] text-[var(--color-wp-text-secondary)] transition hover:border-[var(--color-wp-blue)] hover:bg-brand-500/5"
              >
                {o.label}
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-wp-text-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-wp-blue)]" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {outcome && (
        <Card className={cn("p-5 sm:p-6", tone)}>
          <p className="eyebrow text-[var(--color-wp-text-secondary)]">probable root cause</p>
          <h3 className="mt-2 text-[19px] font-semibold text-[var(--color-wp-text)]">{outcome.label}</h3>
          <p className="mt-1.5 text-[14px] leading-7 text-[var(--color-wp-text-secondary)]">{outcome.verdict}</p>
          <p className="eyebrow mt-5 text-[var(--color-wp-text-secondary)]">next actions</p>
          <ol className="mt-2 space-y-2">
            {outcome.actions.map((a, i) => (
              <li key={a} className="flex gap-2.5 text-[14px] leading-6 text-[var(--color-wp-text-secondary)]">
                <span className="font-mono text-[11px] text-[var(--color-wp-blue)]">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
          {outcome.link && (
            <Link to={outcome.link} className="btn-primary mt-5">
              Open the full article <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </Card>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={back} disabled={path.length <= 1} className="btn-secondary px-3 py-2 disabled:opacity-40">
          <ArrowLeft className="h-3.5 w-3.5" /> back
        </button>
        <button onClick={reset} className="btn-secondary px-3 py-2">
          <RotateCcw className="h-3.5 w-3.5" /> restart tree
        </button>
      </div>
    </div>
  );
}

export function DecisionTreesPage({ id }: { id?: string }) {
  const active = DECISION_TREES.find((t) => t.id === id) ?? DECISION_TREES[0];
  return (
    <>
      <PageHeader eyebrow="decision trees" title="Decision trees" blurb="Answer questions, narrow the layer, get a probable root cause and the next actions. Built from real triage calls." />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">
        <SideNav items={DECISION_TREES} activeId={active.id} base="/decision-trees" iconFor={(t) => t.id} meta={(t) => `${t.nodes.length} questions · ${Object.keys(t.outcomes).length} outcomes`} />
        <div className="min-w-0">
          <SectionHeader eyebrow="interactive triage" title={active.title}>
            {active.blurb}
          </SectionHeader>
          <TreeWalker key={active.id} tree={active} />
        </div>
      </div>
    </>
  );
}



