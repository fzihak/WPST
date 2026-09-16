import { extractToc, type TocItem } from "@/lib/markdown";

/* ────────────────────────────────────────────────────────────────
   Content pipeline.
   Every article is a single `.mdx` file inside `/content/<section>/`,
   exactly like the repository layout. Frontmatter is parsed at runtime;
   the body is rendered by the built-in Markdown renderer.

   content/
     errors/  wordpress/  plugins/  themes/  woocommerce/  elementor/
     lms/     mysql/      hosting/  php/     apache/       nginx/
     performance/ security/ migration/ deployment/ runbooks/
     checklists/ decision-trees/
   ──────────────────────────────────────────────────────────────── */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export type Article = {
  /** "/errors/500-internal-server-error" */
  slug: string;
  /** first path segment, e.g. "errors" */
  section: string;
  file: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeToFix: string;
  appliesTo: string[];
  tags: string[];
  severity: Severity;
  updated: string;
  featured: boolean;
  body: string;
  toc: TocItem[];
  words: number;
  readMinutes: number;
};

const raw = import.meta.glob("../../content/**/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseScalar(value: string): string {
  const v = value.trim();
  if (/^"(.*)"$/.test(v)) return v.slice(1, -1);
  if (/^'(.*)'$/.test(v)) return v.slice(1, -1);
  return v;
}

function parseArray(value: string): string[] {
  const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");
  return inner
    .split(",")
    .map((s) => parseScalar(s))
    .filter(Boolean);
}

function parseFile(file: string, source: string): Article {
  const key = file.replace(/^.*\/content\//, "").replace(/\.mdx$/, "");
  const slug = `/${key}`;
  const section = key.split("/")[0];
  let front: Record<string, string | string[]> = {};
  let body = source;

  if (source.startsWith("---")) {
    const end = source.indexOf("\n---", 3);
    if (end > -1) {
      const block = source.slice(3, end);
      body = source.slice(end + 4).replace(/^\s*\n/, "");
      for (const line of block.split("\n")) {
        const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
        if (!m) continue;
        const [, k, v] = m;
        front[k] = v.startsWith("[") ? parseArray(v) : parseScalar(v);
      }
    }
  }

  const str = (k: string, fallback = "") => (typeof front[k] === "string" ? (front[k] as string) : fallback);
  const arr = (k: string) => (Array.isArray(front[k]) ? (front[k] as string[]) : []);

  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    section,
    file,
    title: str("title", key.split("/").pop() ?? key),
    description: str("description"),
    difficulty: (str("difficulty", "Intermediate") as Difficulty) ?? "Intermediate",
    timeToFix: str("timeToFix", "—"),
    appliesTo: arr("appliesTo"),
    tags: arr("tags"),
    severity: (str("severity", "Medium") as Severity) ?? "Medium",
    updated: str("updated", ""),
    featured: str("featured") === "true",
    body,
    toc: extractToc(body),
    words,
    readMinutes: Math.max(1, Math.round(words / 220)),
  };
}

export const articles: Article[] = Object.entries(raw)
  .map(([file, source]) => parseFile(file, source))
  .sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title));

export const articleBySlug = new Map(articles.map((a) => [a.slug, a]));

export function getArticle(slug: string | undefined): Article | undefined {
  if (!slug) return undefined;
  return articleBySlug.get(slug.startsWith("/") ? slug : `/${slug}`);
}

export function isLive(slug: string): boolean {
  return articleBySlug.has(slug.startsWith("/") ? slug : `/${slug}`);
}

export function bySection(section: string): Article[] {
  return articles.filter((a) => a.section === section);
}

export function sectionCount(section: string): number {
  return bySection(section).length;
}

export function latest(limit = 6): Article[] {
  return [...articles]
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))
    .slice(0, limit);
}

export const featured = (): Article[] => {
  const f = articles.filter((a) => a.featured);
  return f.length ? f : articles.slice(0, 8);
};

export function allTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const a of articles) for (const t of a.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function related(article: Article, limit = 4): Article[] {
  const scored = articles
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      const sharedTags = a.tags.filter((t) => article.tags.includes(t)).length;
      const sameSection = a.section === article.section ? 2 : 0;
      const titleWords = article.title
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4);
      const titleHits = titleWords.filter((w) => a.title.toLowerCase().includes(w)).length;
      return { a, score: sharedTags * 3 + sameSection + titleHits };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || x.a.title.localeCompare(y.a.title));
  return scored.slice(0, limit).map((s) => s.a);
}

export type SearchHit = { article: Article; score: number; excerpt: string };

export function search(query: string, limit = 12): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
  if (!terms.length) return [];

  const hits: SearchHit[] = [];
  for (const a of articles) {
    const title = a.title.toLowerCase();
    const tags = a.tags.join(" ").toLowerCase();
    const applies = a.appliesTo.join(" ").toLowerCase();
    const desc = a.description.toLowerCase();
    const slug = a.slug.toLowerCase();
    const body = a.body.toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      let hit = 0;
      if (title.includes(term)) hit += 14;
      if (slug.includes(term)) hit += 10;
      if (tags.includes(term)) hit += 7;
      if (applies.includes(term)) hit += 5;
      if (desc.includes(term)) hit += 4;
      const bodyCount = body.split(term).length - 1;
      if (bodyCount) hit += Math.min(bodyCount, 6);
      if (!hit) matchedAll = false;
      score += hit;
    }
    if (!matchedAll) continue;

    // excerpt: first line of the body that contains a term
    const lines = a.body.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    const excerpt =
      lines.find((l) => terms.some((t) => l.toLowerCase().includes(t))) ?? a.description ?? lines[0] ?? "";
    hits.push({ article: a, score, excerpt: excerpt.replace(/[*`>]/g, "").slice(0, 190) });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const stats = {
  articles: articles.length,
  sections: new Set(articles.map((a) => a.section)).size,
  tags: allTags().length,
  words: articles.reduce((sum, a) => sum + a.words, 0),
};
