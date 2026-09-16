import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { CHEATSHEETS } from "@/data/cheatsheets";
import { OFFICIAL_RESOURCES } from "@/data/taxonomy";
import { Link } from "@/lib/router";
import { Icon } from "@/components/Icon";
import { Card, PageHeader, SectionHeader } from "@/components/ui";
import { cn } from "@/utils/cn";

const SHEET_ICON: Record<string, string> = {
  "wp-cli": "wp-cli",
  mysql: "cs-mysql",
  permissions: "permissions",
  ftp: "ftp",
  php: "cs-php",
  apache: "cs-apache",
  nginx: "cs-nginx",
  cloudflare: "cloudflare",
  git: "git",
};

export function CopyBtn({ value, label = "copy", className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className={cn("btn-ghost shrink-0", className)}
    >
      {done ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {done ? "copied" : label}
    </button>
  );
}

export function CodeOut({ title, code, note }: { title: string; code: string; note?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-wp-dark-mid)] bg-[var(--color-wp-dark)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-wp-dark-mid)] bg-[#191e23] px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#a7aaad]">{title}</span>
        </div>
        <CopyBtn value={code} className="border-white/15 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white" />
      </div>
      <pre className="scrollbar-thin max-h-[420px] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#f0f0f1]">{code}</pre>
      {note && <p className="border-t border-[var(--color-wp-dark-mid)] bg-[#191e23]/80 px-3.5 py-2 text-[12px] text-[#a7aaad]">{note}</p>}
    </div>
  );
}

/* ── Cheat sheets ──────────────────────────────────────────────── */

export function CheatSheetsPage({ id }: { id?: string }) {
  const active = CHEATSHEETS.find((c) => c.id === id) ?? CHEATSHEETS[0];
  const markdown = [
    `# ${active.title} cheat sheet`,
    "",
    ...active.groups.flatMap((g) => [`## ${g.group}`, ...g.rows.map((r) => `- \`${r.cmd}\` — ${r.desc}`), ""]),
  ].join("\n");

  return (
    <>
      <PageHeader
        eyebrow="cheat sheets"
        title="Cheat sheets"
        blurb="Copy-paste reference for command-line support work: WP-CLI, MySQL, permissions, FTP, PHP, Apache, NGINX, Cloudflare and Git."
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {CHEATSHEETS.map((c) => (
            <Link
              key={c.id}
              to={`/cheat-sheets/${c.id}`}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition",
                c.id === active.id
                  ? "border-brand-500/50 bg-[var(--color-wp-blue-wash)] font-semibold text-[var(--color-wp-blue)]"
                  : "border-[var(--color-wp-border-light)] text-[var(--color-wp-text-secondary)] hover:border-brand-500/40",
              )}
            >
              <Icon name={SHEET_ICON[c.id] ?? "cheat-sheets"} className="h-3.5 w-3.5" />
              {c.title}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-wp-blue-wash)] text-[var(--color-wp-blue)]">
              <Icon name={SHEET_ICON[active.id] ?? "cheat-sheets"} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight text-[var(--color-wp-text)]">{active.title}</h2>
              <p className="mt-0.5 max-w-2xl text-[14px] text-[var(--color-wp-text-secondary)]">{active.blurb}</p>
            </div>
          </div>
          <CopyBtn value={markdown} label="copy whole sheet" />
        </div>

        <div className="mt-6 space-y-7">
          {active.groups.map((g) => (
            <section key={g.group}>
              <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-wp-text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {g.group}
              </h3>
              <div className="card overflow-hidden p-0">
                <ul className="divide-y divide-ink-100">
                  {g.rows.map((r) => (
                    <li key={r.cmd} className="flex flex-col gap-2 px-4 py-3 transition hover:bg-[var(--color-wp-body)]/70 md:flex-row md:items-center md:gap-3">
                      <code className="scrollbar-thin min-w-0 flex-1 overflow-x-auto whitespace-pre rounded-lg bg-[var(--color-wp-body)] px-2.5 py-1.5 font-mono text-[12.5px] text-[var(--color-wp-text)] md:basis-[46%]">
                        {r.cmd}
                      </code>
                      <span className="min-w-0 flex-1 text-[13px] text-[var(--color-wp-text-secondary)]">{r.desc}</span>
                      <CopyBtn value={r.cmd} className="self-start md:self-auto" />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Resources ─────────────────────────────────────────────────── */

export function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="references"
        title="Official resources"
        blurb="A curated list of first-party documentation only. Every article in this lab cites from this list — no content farms, no outdated forum threads."
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        {OFFICIAL_RESOURCES.map((g) => (
          <section key={g.group}>
            <SectionHeader eyebrow="documentation" title={g.group} />
            <div className="grid gap-3 sm:grid-cols-2">
              {g.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener" className="card card-hover group p-4">
                  <p className="flex items-start justify-between gap-2 text-[14.5px] font-semibold text-[var(--color-wp-text)] group-hover:text-[var(--color-wp-blue)]">
                    {l.label}
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-wp-text-light)] group-hover:text-[var(--color-wp-blue)]" />
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[var(--color-wp-text-secondary)]">{l.note}</p>
                  <p className="mt-2 truncate font-mono text-[10.5px] text-[var(--color-wp-text-muted)]">{l.url}</p>
                </a>
              ))}
            </div>
          </section>
        ))}
        <Card className="bg-brand-500/5">
          <p className="text-[13.5px] leading-7 text-[var(--color-wp-text-secondary)]">
            <span className="font-semibold text-[var(--color-wp-text)]">House rule:</span> when an article's behaviour
            changes with a new release, we update the article and link the upstream changelog rather than copying
            documentation text. Upstream docs stay the source of truth; this lab adds the investigation path.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ── Tools ─────────────────────────────────────────────────────── */

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[13.5px] text-[var(--color-wp-text-secondary)] hover:bg-[var(--color-wp-body)]">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-[var(--color-wp-blue)]" : "bg-ink-300",
        )}
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-[18px]" : "left-0.5")} />
      </button>
    </label>
  );
}

function WpConfigTool() {
  const [opts, setOpts] = useState({
    debug: true,
    debugLog: true,
    logPath: false,
    env: true,
    memory: true,
    revisions: false,
    fileEdit: true,
    ssl: false,
    autoupdate: false,
  });
  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const lines: string[] = [
    "/* ── WordPress Support Toolkit (WPST): debug block ─────────",
    "   Add ABOVE the line:  /* That's all, stop editing! *​/",
    "   Remove WP_DEBUG / WP_DEBUG_LOG before going live.       */",
    "",
  ];
  if (opts.debug) lines.push("define( 'WP_DEBUG', true );");
  if (opts.debugLog)
    lines.push(
      opts.logPath
        ? "define( 'WP_DEBUG_LOG', dirname( ABSPATH ) . '/logs/wp-debug.log' ); // outside webroot"
        : "define( 'WP_DEBUG_LOG', true ); // writes to wp-content/debug.log",
    );
  if (opts.debug) lines.push("define( 'WP_DEBUG_DISPLAY', false );", "define( 'SCRIPT_DEBUG', true ); // loads unminified core JS/CSS");
  if (opts.env) lines.push("define( 'WP_ENVIRONMENT_TYPE', 'staging' );");
  if (opts.memory) lines.push("define( 'WP_MEMORY_LIMIT', '256M' );", "define( 'WP_MAX_MEMORY_LIMIT', '512M' ); // admin / cron / imports");
  if (opts.revisions) lines.push("define( 'WP_POST_REVISIONS', 5 );");
  if (opts.fileEdit) lines.push("define( 'DISALLOW_FILE_EDIT', true ); // no plugin/theme editor");
  if (opts.ssl) lines.push("define( 'FORCE_SSL_ADMIN', true );");
  if (opts.autoupdate) lines.push("define( 'WP_AUTO_UPDATE_CORE', 'minor' );");
  lines.push("", "ini_set( 'display_errors', 0 );", "ini_set( 'log_errors', 1 );");

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="p-3">
        <p className="px-2 pb-2 pt-1 text-[13.5px] font-semibold text-[var(--color-wp-text)]">Generate a debug block</p>
        <div className="space-y-0.5">
          {(
            [
              ["debug", "Enable WP_DEBUG"],
              ["debugLog", "Log to file"],
              ["logPath", "Log outside webroot"],
              ["env", "WP_ENVIRONMENT_TYPE = staging"],
              ["memory", "Raise memory limits"],
              ["revisions", "Limit post revisions"],
              ["fileEdit", "Disable file editor"],
              ["ssl", "Force SSL admin"],
              ["autoupdate", "Auto-update core (minor)"],
            ] as [keyof typeof opts, string][]
          ).map(([k, label]) => (
            <Toggle key={k} checked={opts[k]} onChange={() => toggle(k)} label={label} />
          ))}
        </div>
      </Card>
      <CodeOut
        title="wp-config.php"
        code={lines.join("\n")}
        note="Never leave WP_DEBUG on in production: it exposes file paths and notices to visitors when combined with WP_DEBUG_DISPLAY."
      />
    </div>
  );
}

function HtaccessTool() {
  const [opts, setOpts] = useState({
    wp: true,
    indexes: true,
    config: true,
    xmlrpc: true,
    uploads: true,
    headers: true,
    hsts: false,
    https: false,
    limits: false,
    assets: true,
    logs: true,
  });
  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const parts: string[] = ["# ── Generated by WordPress Support Toolkit (WPST) ───────────", ""];
  if (opts.https)
    parts.push(
      "# Force HTTPS (do this AFTER SSL is verified, or you create a loop)",
      "<IfModule mod_rewrite.c>",
      "  RewriteEngine On",
      "  RewriteCond %{HTTPS} !=on",
      "  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]",
      "</IfModule>",
      "",
    );
  if (opts.limits)
    parts.push(
      "# Raise limits for uploads / imports (Apache with mod_php only — fails on PHP-FPM)",
      "<IfModule mod_php.c>",
      "  php_value upload_max_filesize 64M",
      "  php_value post_max_size 64M",
      "  php_value memory_limit 256M",
      "  php_value max_execution_time 300",
      "  php_value max_input_vars 5000",
      "</IfModule>",
      "",
    );
  if (opts.headers)
    parts.push(
      "# Security headers",
      "<IfModule mod_headers.c>",
      '  Header always set X-Content-Type-Options "nosniff"',
      '  Header always set X-Frame-Options "SAMEORIGIN"',
      '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
      '  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"',
      "</IfModule>",
      "",
    );
  if (opts.hsts)
    parts.push(
      "# HSTS — only after HTTPS is working on every hostname",
      "<IfModule mod_headers.c>",
      '  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"',
      "</IfModule>",
      "",
    );
  if (opts.indexes) parts.push("Options -Indexes", "");
  if (opts.config) parts.push("<Files wp-config.php>", "  Require all denied", "</Files>", "");
  if (opts.xmlrpc)
    parts.push("# XML-RPC off (some Jetpack/mobile-app workflows need it — test before keeping this)", "<Files xmlrpc.php>", "  Require all denied", "</Files>", "");
  if (opts.logs) parts.push('<FilesMatch "\\.(log|env|sql|bak|old|ini)$">', "  Require all denied", "</FilesMatch>", "");
  if (opts.uploads)
    parts.push(
      "# Block PHP execution in uploads (defence in depth after a compromise)",
      '<Directory "wp-content/uploads">',
      '  <FilesMatch "\\.(?i:php|phtml|php[0-9])$">',
      "    Require all denied",
      "  </FilesMatch>",
      "</Directory>",
      "",
    );
  if (opts.assets)
    parts.push(
      "<IfModule mod_expires.c>",
      "  ExpiresActive On",
      '  ExpiresByType image/webp "access plus 1 year"',
      '  ExpiresByType text/css "access plus 1 month"',
      '  ExpiresByType application/javascript "access plus 1 month"',
      "</IfModule>",
      "",
    );
  if (opts.wp)
    parts.push(
      "# BEGIN WordPress  (never edit inside these markers — WordPress rewrites them)",
      "<IfModule mod_rewrite.c>",
      "  RewriteEngine On",
      "  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]",
      "  RewriteBase /",
      "  RewriteRule ^index\\.php$ - [L]",
      "  RewriteCond %{REQUEST_FILENAME} !-f",
      "  RewriteCond %{REQUEST_FILENAME} !-d",
      "  RewriteRule . /index.php [L]",
      "</IfModule>",
      "# END WordPress",
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="p-3">
        <p className="px-2 pb-2 pt-1 text-[13.5px] font-semibold text-[var(--color-wp-text)]">Build a safe .htaccess</p>
        <div className="space-y-0.5">
          {(
            [
              ["wp", "WordPress rewrite block"],
              ["indexes", "Disable directory listing"],
              ["config", "Block wp-config.php"],
              ["xmlrpc", "Disable XML-RPC"],
              ["uploads", "Block PHP in uploads"],
              ["headers", "Security headers"],
              ["hsts", "HSTS (verified HTTPS only)"],
              ["https", "Force HTTPS redirect"],
              ["limits", "Raise upload/memory limits"],
              ["assets", "Expires for static assets"],
              ["logs", "Deny .log/.env/.sql files"],
            ] as [keyof typeof opts, string][]
          ).map(([k, label]) => (
            <Toggle key={k} checked={opts[k]} onChange={() => toggle(k)} label={label} />
          ))}
        </div>
        <p className="px-2 pt-3 text-[12px] leading-6 text-[var(--color-wp-text-secondary)]">
          Always validate on staging. Keep a copy of the working file so a bad rule can be reverted instantly via FTP.
        </p>
      </Card>
      <CodeOut title=".htaccess" code={parts.join("\n")} note="php_value directives only work with mod_php. On PHP-FPM hosts use .user.ini or the hosting panel instead." />
    </div>
  );
}

function LimitsTool() {
  const [kind, setKind] = useState("woocommerce");
  const [builder, setBuilder] = useState("elementor");
  const [plugins, setPlugins] = useState(35);
  const [traffic, setTraffic] = useState("medium");

  const profiles: Record<string, { mem: number; exec: number; inputs: number }> = {
    blog: { mem: 256, exec: 120, inputs: 3000 },
    business: { mem: 256, exec: 180, inputs: 5000 },
    woocommerce: { mem: 512, exec: 300, inputs: 5000 },
    lms: { mem: 512, exec: 600, inputs: 8000 },
    enterprise: { mem: 768, exec: 600, inputs: 10000 },
  };
  const builders: Record<string, number> = { none: 0, elementor: 128, divi: 160, wpbakery: 128, gutenberg: 32 };
  const profile = profiles[kind];
  const extra = builders[builder] + Math.max(0, plugins - 20) * 2;
  const mem = Math.min(1024, Math.round((profile.mem + extra) / 64) * 64);
  const exec = profile.exec + (builder === "none" ? 0 : 120);
  const inputs = profile.inputs + (kind === "woocommerce" || kind === "lms" ? 2000 : 0);
  const opcache = traffic === "high" ? 256 : traffic === "medium" ? 192 : 128;

  const phpIni = [
    "; ── Recommended PHP configuration ─────────────",
    `memory_limit = ${mem}M`,
    `max_execution_time = ${exec}`,
    `max_input_time = ${exec}`,
    `max_input_vars = ${inputs}`,
    "upload_max_filesize = 64M",
    "post_max_size = 80M",
    "; Logging",
    "log_errors = On",
    "display_errors = Off",
    "error_log = /home/USER/logs/php_error.log",
    "; OPcache",
    "opcache.enable = 1",
    `opcache.memory_consumption = ${opcache}`,
    "opcache.max_accelerated_files = 20000",
    "opcache.validate_timestamps = 1",
    "opcache.revalidate_freq = 2",
    "; Uploads",
    "max_file_uploads = 30",
  ].join("\n");

  const wpConfig = [`define( 'WP_MEMORY_LIMIT', '${mem}M' );`, `define( 'WP_MAX_MEMORY_LIMIT', '${Math.min(1024, mem + 256)}M' );`].join("\n");

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <p className="text-[13.5px] font-semibold text-[var(--color-wp-text)]">Size the environment</p>
        <div className="mt-3 space-y-3">
          <label className="block text-[12.5px] text-[var(--color-wp-text-secondary)]">
            Store type
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="field mt-1 py-2">
              <option value="blog">Blog / brochure</option>
              <option value="business">Business site with forms</option>
              <option value="woocommerce">WooCommerce store</option>
              <option value="lms">LMS / membership</option>
              <option value="enterprise">Heavy custom app</option>
            </select>
          </label>
          <label className="block text-[12.5px] text-[var(--color-wp-text-secondary)]">
            Page builder
            <select value={builder} onChange={(e) => setBuilder(e.target.value)} className="field mt-1 py-2">
              <option value="none">None / block theme</option>
              <option value="gutenberg">Gutenberg blocks only</option>
              <option value="elementor">Elementor</option>
              <option value="wpbakery">WPBakery</option>
              <option value="divi">Divi</option>
            </select>
          </label>
          <label className="block text-[12.5px] text-[var(--color-wp-text-secondary)]">
            Active plugins: <span className="font-mono text-[var(--color-wp-text-secondary)]">{plugins}</span>
            <input type="range" min={5} max={90} value={plugins} onChange={(e) => setPlugins(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
          </label>
          <label className="block text-[12.5px] text-[var(--color-wp-text-secondary)]">
            Traffic
            <select value={traffic} onChange={(e) => setTraffic(e.target.value)} className="field mt-1 py-2">
              <option value="low">Low (&lt; 5k visits/mo)</option>
              <option value="medium">Medium (5k–100k)</option>
              <option value="high">High (&gt; 100k)</option>
            </select>
          </label>
        </div>
      </Card>
      <div className="space-y-4">
        <dl className="grid grid-cols-3 gap-3">
          {[
            { k: "memory_limit", v: `${mem}M` },
            { k: "max_execution_time", v: `${exec}s` },
            { k: "max_input_vars", v: `${inputs}` },
          ].map((s) => (
            <div key={s.k} className="card p-4">
              <dt className="truncate font-mono text-[10px] uppercase tracking-widest text-[var(--color-wp-text-muted)]">{s.k}</dt>
              <dd className="mt-1 font-mono text-[18px] font-semibold text-[var(--color-wp-text)] sm:text-[22px]">{s.v}</dd>
            </div>
          ))}
        </dl>
        <CodeOut title=".user.ini / php.ini" code={phpIni} />
        <CodeOut title="wp-config.php additions" code={wpConfig} note="These are per-request limits. If a single operation still hits them, the fix is batching — not raising limits forever." />
      </div>
    </div>
  );
}

export function ToolsPage() {
  const [tab, setTab] = useState<"wpconfig" | "htaccess" | "limits">("wpconfig");
  const tabs = [
    { id: "wpconfig" as const, label: "Debug block generator", icon: "debug" },
    { id: "htaccess" as const, label: ".htaccess builder", icon: "apache" },
    { id: "limits" as const, label: "Environment sizer", icon: "performance" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="tools"
        title="Support tools & generators"
        blurb="Client-side only. Nothing you type is transmitted — these generators build the config snippets you paste into a ticket or onto a server."
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition",
                tab === t.id
                  ? "border-brand-500/50 bg-[var(--color-wp-blue-wash)] font-semibold text-[var(--color-wp-blue)]"
                  : "border-[var(--color-wp-border-light)] text-[var(--color-wp-text-secondary)] hover:border-brand-500/40",
              )}
            >
              <Icon name={t.icon} className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === "wpconfig" && <WpConfigTool />}
          {tab === "htaccess" && <HtaccessTool />}
          {tab === "limits" && <LimitsTool />}
        </div>
      </div>
    </>
  );
}



