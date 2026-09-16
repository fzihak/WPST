import { Clock } from "lucide-react";
import { Link } from "@/lib/router";
import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "rose" | "amber" | "emerald" | "violet" | "sky";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-[var(--color-wp-border)] bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)]",
    brand: "border-[rgba(34,113,177,0.3)] bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue-dark)]",
    rose: "border-[rgba(214,54,56,0.3)] bg-[var(--color-wp-error-light)] text-[var(--color-wp-error)]",
    amber: "border-[rgba(219,166,23,0.3)] bg-[var(--color-wp-warning-light)] text-[#8b6914]",
    emerald: "border-[rgba(0,163,42,0.3)] bg-[var(--color-wp-success-light)] text-[var(--color-wp-success)]",
    violet: "border-violet-300/40 bg-violet-50 text-violet-700",
    sky: "border-sky-300/40 bg-sky-50 text-sky-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DifficultyPip({ level }: { level: string }) {
  const map: Record<string, { tone: "emerald" | "sky" | "amber" | "rose"; dots: number }> = {
    Beginner: { tone: "emerald", dots: 1 },
    Intermediate: { tone: "sky", dots: 2 },
    Advanced: { tone: "amber", dots: 3 },
    Expert: { tone: "rose", dots: 4 },
  };
  const conf = map[level] ?? map.Intermediate;
  const colors: Record<string, string> = {
    emerald: "bg-[var(--color-wp-success)]",
    sky: "bg-sky-500",
    amber: "bg-[var(--color-wp-warning)]",
    rose: "bg-[var(--color-wp-error)]",
  };
  return (
    <Badge tone={conf.tone}>
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 w-1.5 rounded-full", i < conf.dots ? colors[conf.tone] : "bg-current opacity-25")}
          />
        ))}
      </span>
      {level}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, "rose" | "amber" | "sky" | "emerald"> = {
    Critical: "rose",
    High: "rose",
    Medium: "amber",
    Low: "emerald",
  };
  return <Badge tone={map[severity] ?? "amber"}>{severity} impact</Badge>;
}

export function TimeChip({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10.5px]" style={{ color: "var(--color-wp-text-muted)" }}>
      <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
      {value}
    </span>
  );
}

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return <div className={cn("card p-5", hover && "card-hover", className)}>{children}</div>;
}

export function Tag({ tag }: { tag: string }) {
  return (
    <Link
      to={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium transition hover:border-[var(--color-wp-blue)] hover:text-[var(--color-wp-blue)]"
      style={{ borderColor: "var(--color-wp-border-light)", backgroundColor: "var(--color-wp-body)", color: "var(--color-wp-text-secondary)" }}
    >
      #{tag}
    </Link>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[22px] font-bold tracking-tight sm:text-[26px]" style={{ color: "var(--color-wp-text)" }}>{title}</h2>
        {children && <p className="mt-1.5 max-w-2xl text-[14px] leading-6" style={{ color: "var(--color-wp-text-secondary)" }}>{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  blurb,
  children,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-wp-border-light)", backgroundColor: "var(--color-wp-white)" }}>
      <div className="glow pointer-events-none absolute inset-0" />
      <div className="grid-noise pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-balance text-[28px] font-bold leading-[1.1] tracking-tight sm:text-[38px]" style={{ color: "var(--color-wp-text)" }}>
          {title}
        </h1>
        {blurb && <p className="mt-3 max-w-3xl text-[15px] leading-7" style={{ color: "var(--color-wp-text-secondary)" }}>{blurb}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="card border-dashed p-8 text-center text-[14px]" style={{ color: "var(--color-wp-text-secondary)" }}>{children}</div>
  );
}

export function IconTile({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "rose" | "amber" | "emerald" | "neutral";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]",
    rose: "bg-[var(--color-wp-error-light)] text-[var(--color-wp-error)]",
    amber: "bg-[var(--color-wp-warning-light)] text-[#8b6914]",
    emerald: "bg-[var(--color-wp-success-light)] text-[var(--color-wp-success)]",
    neutral: "bg-[var(--color-wp-body)] text-[var(--color-wp-text-secondary)]",
  };
  return (
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", tones[tone], className)}>
      {children}
    </span>
  );
}
