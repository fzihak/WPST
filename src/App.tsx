import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ArticleView } from "@/components/ArticleView";
import { Home } from "@/pages/Home";
import {
  CategoriesPage,
  CategoryPage,
  ErrorIndexPage,
  KnowledgeBasePage,
  SearchPage,
  TagPage,
  TagsPage,
} from "@/pages/Browse";
import { ChecklistsPage, DecisionTreesPage, RunbooksPage } from "@/pages/Reference";
import { CheatSheetsPage, ResourcesPage, ToolsPage } from "@/pages/Library";
import { ContributePage, DashboardPage, HowItWorksPage } from "@/pages/Meta";
import { getArticle, search } from "@/lib/content";
import { Link, useRoute } from "@/lib/router";
import { Card, Empty, PageHeader } from "@/components/ui";

function NotFound({ path }: { path: string }) {
  const term = path.split("/").filter(Boolean).pop() ?? "";
  const hits = term ? search(term.replace(/[-_]/g, " "), 5) : [];
  useEffect(() => {
    document.title = "404 — WordPress Support Toolkit";
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="404"
        title={`Nothing filed under ${path}`}
        blurb="The article you wanted probably exists under a slightly different slug. Search, or browse the taxonomy."
      >
        <div className="flex flex-wrap gap-2">
          <Link to="/knowledge-base" className="rounded-xl bg-brand-600 px-4 py-2 text-[13.5px] font-medium text-white hover:bg-brand-700">
            Browse all articles
          </Link>
          <Link
            to="/categories"
            className="rounded-xl border border-ink-300 px-4 py-2 text-[13.5px] font-medium text-ink-700 hover:border-brand-500/50 dark:border-ink-700 dark:text-ink-200"
          >
            Category map
          </Link>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {hits.length > 0 ? (
          <Card>
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-ink-400">did you mean</p>
            <ul className="space-y-2">
              {hits.map((h) => (
                <li key={h.article.slug}>
                  <Link to={h.article.slug} className="text-[14.5px] font-medium text-ink-800 hover:text-brand-600 dark:text-ink-100">
                    {h.article.title}
                  </Link>
                  <span className="ml-2 font-mono text-[11px] text-ink-400">{h.article.slug}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Empty>No close match. Use search (Ctrl/Cmd + K) or the category map to find the right section.</Empty>
        )}
      </div>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const [first, second] = route.segments;
  const article = getArticle(route.path);

  useEffect(() => {
    document.title = article ? `${article.title} — WordPress Support Toolkit` : "WordPress Support Toolkit (WPST)";
  }, [article]);

  let page: React.ReactNode;

  if (article) page = <ArticleView article={article} />;
  else if (!first) page = <Home />;
  else
    switch (first) {
      case "dashboard":
        page = <DashboardPage />;
        break;
      case "knowledge-base":
        page = <KnowledgeBasePage />;
        break;
      case "search":
        page = <SearchPage />;
        break;
      case "categories":
        page = <CategoriesPage />;
        break;
      case "category":
        page = second ? <CategoryPage id={second} /> : <CategoriesPage />;
        break;
      case "errors":
        page = <ErrorIndexPage />;
        break;
      case "tags":
        page = <TagsPage />;
        break;
      case "tag":
        page = second ? <TagPage tag={second} /> : <TagsPage />;
        break;
      case "runbooks":
        page = <RunbooksPage id={second} />;
        break;
      case "checklists":
        page = <ChecklistsPage id={second} />;
        break;
      case "decision-trees":
        page = <DecisionTreesPage id={second} />;
        break;
      case "cheat-sheets":
        page = <CheatSheetsPage id={second} />;
        break;
      case "resources":
        page = <ResourcesPage />;
        break;
      case "tools":
        page = <ToolsPage />;
        break;
      case "contribute":
        page = <ContributePage />;
        break;
      case "how-it-works":
        page = <HowItWorksPage />;
        break;
      default:
        page = <NotFound path={route.path} />;
    }

  return <Layout>{page}</Layout>;
}
