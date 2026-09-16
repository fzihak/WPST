import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

/**
 * Tiny hash-based router. Works from any static host / single-file build:
 *   #/errors/500-internal-server-error
 *   #/knowledge-base?section=php
 *   #/checklists#pre-launch
 */

export type Route = {
  /** e.g. "/errors/500-internal-server-error" */
  path: string;
  /** path segments, decoded */
  segments: string[];
  query: URLSearchParams;
  /** in-page anchor, e.g. "/runbooks/site-down#step-3" -> "step-3" */
  anchor: string;
};

function readLocation(): Route {
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.pathname.replace(/index\.html$/, "");
  const clean = (raw || "/").replace(/\/+$/, "") || "/";
  const [beforeHash, anchor = ""] = clean.split("#");
  const [pathname, query = ""] = beforeHash.split("?");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  let segments: string[] = [];
  try {
    segments = path
      .split("/")
      .filter(Boolean)
      .map((s) => decodeURIComponent(s));
  } catch {
    segments = path.split("/").filter(Boolean);
  }
  return { path, segments, query: new URLSearchParams(query), anchor: anchor || "" };
}

export function navigate(to: string, opts?: { replace?: boolean; keepScroll?: boolean }) {
  const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
  if (window.location.hash === target) return;
  if (opts?.replace) {
    window.history.replaceState(null, "", target);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined"
      ? { path: "/", segments: [], query: new URLSearchParams(), anchor: "" }
      : readLocation(),
  );

  useEffect(() => {
    const onChange = () => setRoute(readLocation());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  return route;
}

export function useScrollReset(path: string, anchor: string) {
  useEffect(() => {
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path, anchor]);
}

export function Link({
  to,
  children,
  className,
  title,
  onClick,
  activeClassName,
  style,
  "aria-label": ariaLabel,
}: {
  to: string;
  children?: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
  activeClassName?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}) {
  const route = useRoute();
  const isActive = useMemo(() => {
    const base = route.path === "/" ? "/" : `/${route.segments[0]}`;
    if (to === "/") return route.path === "/";
    return base === to || route.path.startsWith(`${to}/`);
  }, [route.path, route.segments, to]);

  const handle = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      onClick?.();
      navigate(to);
    },
    [to, onClick],
  );

  return (
    <a
      href={`#${to}`}
      title={title}
      aria-label={ariaLabel}
      onClick={handle}
      style={style}
      className={cn(className, isActive && activeClassName)}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </a>
  );
}
