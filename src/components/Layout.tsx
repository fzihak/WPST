import { useEffect, useState } from "react";
import { ChevronDown, Command, Menu, Search, X } from "lucide-react";
import { Link, useRoute, useScrollReset, navigate } from "@/lib/router";
import { SearchPalette } from "@/components/SearchPalette";
import { Icon } from "@/components/Icon";
import { SECTIONS } from "@/data/taxonomy";
import { cn } from "@/utils/cn";
import logoImg from "@/assets/logo_wpst.png";

const PRIMARY_NAV = [
  { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
  { label: "Knowledge Base", to: "/knowledge-base", icon: "knowledge-base" },
  { label: "Error Codes", to: "/errors", icon: "errors" },
  { label: "Runbooks", to: "/runbooks", icon: "runbooks" },
  { label: "Checklists", to: "/checklists", icon: "checklists" },
  { label: "Cheat Sheets", to: "/cheat-sheets", icon: "cheat-sheets" },
];

const MORE_NAV = [
  { label: "Categories", to: "/categories", icon: "categories" },
  { label: "Decision Trees", to: "/decision-trees", icon: "decision-trees" },
  { label: "Tools", to: "/tools", icon: "tools" },
  { label: "Resources", to: "/resources", icon: "resources" },
  { label: "All Tags", to: "/tags", icon: "tags" },
  { label: "Contribute", to: "/contribute", icon: "contribute" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const route = useRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useScrollReset(route.path, route.anchor);

  useEffect(() => {
    setMobileOpen(false);
    setKbOpen(false);
    setMoreOpen(false);
  }, [route.path]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const kbActive = ["knowledge-base", "category", "categories"].includes(route.segments[0] ?? "");

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-lg focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        style={{ backgroundColor: "var(--color-wp-blue)" }}
      >
        Skip to content
      </a>

      {/* ── Main header (WP dark sidebar color) ────────────────────── */}
      <header
        className="sticky top-0 z-80 backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(29, 35, 39, 0.97)",
          borderBottom: "1px solid var(--color-wp-dark-mid)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <img
              src={logoImg}
              alt="WordPress Support Toolkit"
              className="h-9 w-9 rounded-full bg-white p-1 shadow-sm ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-[15.5px] font-bold tracking-tight text-white transition-colors group-hover:text-[#72aee6]">
              <span className="hidden sm:inline">WordPress Support Toolkit</span>
              <span className="sm:hidden">WPST</span>
            </span>
          </Link>

          <nav className="ml-3 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) =>
              item.to === "/knowledge-base" ? (
                <div
                  key={item.to}
                  className="relative"
                  onMouseEnter={() => setKbOpen(true)}
                  onMouseLeave={() => setKbOpen(false)}
                >
                  <button
                    onClick={() => {
                      navigate(item.to);
                      setKbOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition",
                      kbActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                    aria-expanded={kbOpen}
                  >
                    {item.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 text-white/40 transition", kbOpen && "rotate-180")} />
                  </button>
                  {kbOpen && (
                    <div className="absolute left-0 top-full w-[620px] pt-2">
                      <div className="card grid grid-cols-2 gap-0.5 p-2 shadow-2xl">
                        {SECTIONS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              navigate(`/category/${s.id}`);
                              setKbOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[var(--color-wp-blue-wash)]"
                          >
                            <span
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
                              style={{ backgroundColor: "var(--color-wp-body)", color: "var(--color-wp-text-secondary)" }}
                            >
                              <Icon name={s.icon} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--color-wp-text)" }}>
                                {s.title}
                              </span>
                              <span className="block font-mono text-[10.5px]" style={{ color: "var(--color-wp-text-muted)" }}>{s.short}/</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  activeClassName="bg-white/15 text-white!"
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-expanded={moreOpen}
              >
                More
                <ChevronDown className={cn("h-3.5 w-3.5 text-white/40 transition", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full w-60 pt-2">
                  <div className="card p-1.5 shadow-2xl">
                    {MORE_NAV.map((m) => (
                      <Link
                        key={m.to}
                        to={m.to}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition hover:bg-[var(--color-wp-blue-wash)]"
                        style={{ color: "var(--color-wp-text-secondary)" }}
                      >
                        <Icon name={m.icon} className="h-4 w-4" style={{ color: "var(--color-wp-text-muted)" } as React.CSSProperties} />
                        {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 text-[12px] text-white/70 transition hover:bg-white/15 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Search docs...</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className="grid h-8 w-8 place-items-center rounded-md border border-white/20 text-white/70 lg:hidden hover:bg-white/10"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="scrollbar-thin max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t px-4 py-4 lg:hidden"
            style={{ backgroundColor: "var(--color-wp-dark)", borderColor: "var(--color-wp-dark-mid)" }}
          >
            {/* Mobile logo */}
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <img src={logoImg} alt="WordPress Support Toolkit" className="h-8 w-8 rounded-full bg-white p-1 shadow-sm ring-1 ring-white/20" />
              <span className="text-[14.5px] font-bold text-white">WordPress Support Toolkit</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[...PRIMARY_NAV, ...MORE_NAV].map((m) => (
                <Link
                  key={m.to}
                  to={m.to}
                  className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/10"
                >
                  <Icon name={m.icon} className="h-4 w-4 text-white/50" />
                  {m.label}
                </Link>
              ))}
            </div>
            <p className="eyebrow mt-5 text-white/50">Categories</p>
            <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {SECTIONS.map((s) => (
                <Link
                  key={s.id}
                  to={`/category/${s.id}`}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-white/70 hover:bg-white/10"
                >
                  <Icon name={s.icon} className="h-4 w-4 text-white/50" />
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      {/* ── Footer (WP dark) ───────────────────────────────────────── */}
      <footer style={{ backgroundColor: "var(--color-wp-dark)", color: "var(--color-wp-text-light)" }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="WordPress Support Toolkit"
                  className="h-8 w-8 rounded-full bg-white p-1 shadow-sm ring-1 ring-white/20"
                />
                <span className="text-[15px] font-bold text-white">WordPress Support Toolkit</span>
              </div>
              <p className="mt-3 max-w-xs text-[13px] leading-6 text-white/50">
                The open knowledge base for WordPress troubleshooting. Investigation-first articles, runbooks and
                checklists for support engineers, developers, agencies and hosting teams.
              </p>
              <p className="mt-3 font-mono text-[11px] text-white/30">static build · MDX content · zero backend</p>
            </div>
            <nav aria-label="Knowledge base">
              <p className="eyebrow text-white/40">Knowledge base</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                {SECTIONS.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <Link to={`/category/${s.id}`} className="text-white/60 hover:text-white transition">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Workflow">
              <p className="eyebrow text-white/40">Workflow</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  { to: "/runbooks", label: "Runbooks" },
                  { to: "/checklists", label: "Checklists" },
                  { to: "/decision-trees", label: "Decision trees" },
                  { to: "/cheat-sheets", label: "Cheat sheets" },
                  { to: "/tools", label: "Tools & generators" },
                  { to: "/tags", label: "Tags" },
                  { to: "/resources", label: "Official references" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-white/60 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Project">
              <p className="eyebrow text-white/40">Project</p>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  { to: "/contribute", label: "Contribute an article" },
                  { to: "/how-it-works", label: "How the lab works" },
                  { to: "/dashboard", label: "Support dashboard" },
                  { to: "/categories", label: "Content roadmap" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-white/60 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 font-mono text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <p>MIT licensed · content contributed by the WordPress support community</p>
            <p>WordPress® is a registered trademark of the WordPress Foundation. This project is not affiliated.</p>
          </div>
        </div>
      </footer>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
