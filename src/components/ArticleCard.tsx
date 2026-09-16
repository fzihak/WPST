import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/router";
import type { Article } from "@/lib/content";
import { SECTIONS } from "@/data/taxonomy";
import { Icon } from "@/components/Icon";
import { DifficultyPip, Tag, TimeChip } from "@/components/ui";
import { cn } from "@/utils/cn";

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const section = SECTIONS.find((s) => s.id === article.section);
  return (
    <article className={cn("card card-hover group relative flex h-full flex-col p-5", compact && "p-4")}>
      <Link to={article.slug} className="absolute inset-0 rounded-xl" aria-label={article.title} />
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md transition group-hover:bg-[var(--color-wp-blue-wash)] group-hover:text-[var(--color-wp-blue)]"
          style={{ backgroundColor: "var(--color-wp-body)", color: "var(--color-wp-text-secondary)" }}
        >
          <Icon name={section?.icon ?? "resources"} className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate font-mono text-[10.5px] uppercase tracking-wider" style={{ color: "var(--color-wp-text-muted)" }}>
          {section?.title ?? article.section}
        </span>
        <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 transition group-hover:text-[var(--color-wp-blue)]" style={{ color: "var(--color-wp-border)" }} />
      </div>
      <h3
        className="mt-3 text-[16px] font-semibold leading-snug tracking-tight transition group-hover:text-[var(--color-wp-blue)]"
        style={{ color: "var(--color-wp-text)" }}
      >
        {article.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-6" style={{ color: "var(--color-wp-text-secondary)" }}>{article.description}</p>
      {!compact && article.tags.length > 0 && (
        <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((t) => (
            <Tag key={t} tag={t} />
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4">
        <DifficultyPip level={article.difficulty} />
        <TimeChip value={article.timeToFix} />
        <span className="font-mono text-[10.5px]" style={{ color: "var(--color-wp-text-muted)" }}>{article.readMinutes} min read</span>
      </div>
    </article>
  );
}
