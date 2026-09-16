/* ────────────────────────────────────────────────────────────────
   Taxonomy: navigation, content sections and every topic in the
   knowledge base. Topics whose `slug` resolves to an existing
   `content/<section>/<slug>.mdx` file are live; the rest are
   rendered as planned so the map stays honest.
   `icon` is a key from src/components/Icon.tsx.
   ──────────────────────────────────────────────────────────────── */

export type Topic = { label: string; slug: string };
export type Section = {
  id: string;
  title: string;
  short: string;
  blurb: string;
  icon: string;
  topics: Topic[];
};

export const SECTIONS: Section[] = [
  {
    id: "errors",
    title: "Error Codes",
    short: "errors",
    blurb: "One page per error — symptoms, investigation path, resolution, verification.",
    icon: "errors",
    topics: [
      { label: "500 Internal Server Error", slug: "/errors/500-internal-server-error" },
      { label: "White Screen of Death", slug: "/errors/white-screen-of-death" },
      { label: "Allowed Memory Size Exhausted", slug: "/errors/allowed-memory-size-exhausted" },
      { label: "ERR_TOO_MANY_REDIRECTS", slug: "/errors/err-too-many-redirects" },
      { label: "Error Establishing Database Connection", slug: "/errors/error-establishing-database-connection" },
      { label: "There has been a critical error", slug: "/errors/critical-error" },
      { label: "403 Forbidden", slug: "/errors/403-forbidden" },
      { label: "404 Not Found", slug: "/errors/404-not-found" },
      { label: "Mixed Content Warning", slug: "/errors/mixed-content" },
      { label: "SSL Handshake Failed", slug: "/errors/ssl-handshake-failed" },
      { label: "502 Bad Gateway", slug: "/errors/502-bad-gateway" },
      { label: "503 Service Unavailable", slug: "/errors/503-service-unavailable" },
      { label: "504 Gateway Timeout", slug: "/errors/504-gateway-timeout" },
      { label: "Error Uploading File (media)", slug: "/errors/error-uploading-file" },
    ],
  },
  {
    id: "wordpress",
    title: "WordPress Core",
    short: "wordpress",
    blurb: "Installation, updates, cron, permalinks, users, REST API and recovery mode.",
    icon: "wordpress",
    topics: [
      { label: "Installation failing", slug: "/wordpress/installation-failing" },
      { label: "Update failed / stuck maintenance mode", slug: "/wordpress/update-failed" },
      { label: "Recovery Mode", slug: "/wordpress/recovery-mode" },
      { label: "Site Health report", slug: "/wordpress/site-health" },
      { label: "WP-Cron not running", slug: "/wordpress/cron-not-running" },
      { label: "Permalinks 404", slug: "/wordpress/permalinks-404" },
      { label: "User roles & capabilities", slug: "/wordpress/user-roles" },
      { label: "REST API blocked", slug: "/wordpress/rest-api-blocked" },
      { label: "XML-RPC disabled", slug: "/wordpress/xmlrpc" },
      { label: "Media & uploads library", slug: "/wordpress/media-uploads" },
    ],
  },
  {
    id: "plugins",
    title: "Plugin Issues",
    short: "plugins",
    blurb: "Conflicts, fatal errors, activation failures, auto-updates and licensing.",
    icon: "plugins",
    topics: [
      { label: "Plugin conflict diagnosis", slug: "/plugins/plugin-conflict" },
      { label: "Plugin fatal error", slug: "/plugins/plugin-fatal-error" },
      { label: "Plugin activation failed", slug: "/plugins/activation-failed" },
      { label: "Auto update failed", slug: "/plugins/auto-update-failed" },
      { label: "Deprecated functions & PHP 8", slug: "/plugins/deprecated-functions" },
      { label: "License activation issues", slug: "/plugins/license-activation" },
      { label: "Broken hooks & priorities", slug: "/plugins/broken-hooks" },
    ],
  },
  {
    id: "themes",
    title: "Theme Issues",
    short: "themes",
    blurb: "Broken layouts, missing stylesheets, customizer, template hierarchy, child themes.",
    icon: "themes",
    topics: [
      { label: "Broken layout / unstyled site", slug: "/themes/broken-layout" },
      { label: "Missing stylesheet error", slug: "/themes/missing-stylesheet" },
      { label: "Customizer not saving", slug: "/themes/customizer-not-saving" },
      { label: "Template hierarchy", slug: "/themes/template-hierarchy" },
      { label: "Child theme setup", slug: "/themes/child-theme" },
      { label: "functions.php fatal error", slug: "/themes/functions-php-error" },
    ],
  },
  {
    id: "woocommerce",
    title: "WooCommerce",
    short: "woocommerce",
    blurb: "Checkout, orders, payments, emails, taxes, shipping, sessions, cart, AJAX.",
    icon: "woocommerce",
    topics: [
      { label: "Payment failed / order not paid", slug: "/woocommerce/payment-failed" },
      { label: "Checkout page not loading", slug: "/woocommerce/checkout-broken" },
      { label: "Order emails not sending", slug: "/woocommerce/order-emails-not-sending" },
      { label: "Cart & session issues", slug: "/woocommerce/cart-session-lost" },
      { label: "Taxes not calculating", slug: "/woocommerce/taxes-not-calculating" },
      { label: "Shipping zones misapplied", slug: "/woocommerce/shipping-zones" },
      { label: "Coupons rejected", slug: "/woocommerce/coupons" },
      { label: "Checkout AJAX / HPOS issues", slug: "/woocommerce/checkout-ajax" },
    ],
  },
  {
    id: "elementor",
    title: "Elementor",
    short: "elementor",
    blurb: "Safe mode, CSS regeneration, containers, flexbox, responsive bugs, template import.",
    icon: "elementor",
    topics: [
      { label: "Elementor CSS not loading", slug: "/elementor/css-not-loading" },
      { label: "Safe Mode troubleshooting", slug: "/elementor/safe-mode" },
      { label: "Containers & flexbox layout bugs", slug: "/elementor/containers-flexbox" },
      { label: "Responsive breakpoints broken", slug: "/elementor/responsive-broken" },
      { label: "Template import failed", slug: "/elementor/template-import" },
      { label: "Editor stuck on loading", slug: "/elementor/editor-loading" },
    ],
  },
  {
    id: "lms",
    title: "LMS",
    short: "lms",
    blurb: "Tutor LMS, LearnDash, LifterLMS, MasterStudy — progress, quizzes, certificates.",
    icon: "lms",
    topics: [
      { label: "Tutor LMS progress not saving", slug: "/lms/tutor-lms-progress-not-saving" },
      { label: "LearnDash quiz not submitting", slug: "/lms/learndash-quiz" },
      { label: "LifterLMS access / membership", slug: "/lms/lifterlms-access" },
      { label: "MasterStudy enrolment errors", slug: "/lms/masterstudy" },
      { label: "Certificates not generating", slug: "/lms/certificates" },
    ],
  },
  {
    id: "mysql",
    title: "Database & MySQL",
    short: "mysql",
    blurb: "MySQL, phpMyAdmin, repair, optimize, connection refused, corruption, search-replace.",
    icon: "mysql",
    topics: [
      { label: "Repair corrupted tables", slug: "/mysql/database-repair" },
      { label: "Connection refused", slug: "/mysql/connection-refused" },
      { label: "Search & replace after migration", slug: "/mysql/search-replace" },
      { label: "Optimize & clean tables", slug: "/mysql/optimize-tables" },
      { label: "phpMyAdmin access & import limits", slug: "/mysql/phpmyadmin" },
    ],
  },
  {
    id: "hosting",
    title: "Hosting & Server Panel",
    short: "hosting",
    blurb: "cPanel, Plesk, FTP/SFTP, SSH, File Manager, DNS, SSL, cron, PHP version, memory.",
    icon: "hosting",
    topics: [
      { label: "cPanel crash course", slug: "/hosting/cpanel" },
      { label: "FTP / SFTP access troubleshooting", slug: "/hosting/ftp-sftp" },
      { label: "DNS not propagating", slug: "/hosting/dns-not-propagating" },
      { label: "SSL certificate issues", slug: "/hosting/ssl-certificate" },
      { label: "Cron jobs & scheduled tasks", slug: "/hosting/cron-jobs" },
      { label: "PHP version & memory in panel", slug: "/hosting/php-version" },
      { label: "Server logs (Apache / Nginx)", slug: "/hosting/server-logs" },
    ],
  },
  {
    id: "php",
    title: "PHP",
    short: "php",
    blurb: "Memory limits, fatal errors, OPcache, upload limits, version compatibility.",
    icon: "php",
    topics: [
      { label: "PHP memory limit", slug: "/php/memory-limit" },
      { label: "Fatal error & stack traces", slug: "/php/fatal-errors" },
      { label: "OPcache stale code", slug: "/php/opcache" },
      { label: "upload_max_filesize / post_max_size", slug: "/php/upload-limits" },
      { label: "PHP 7.x → 8.x compatibility", slug: "/php/php8-compatibility" },
    ],
  },
  {
    id: "apache",
    title: "Apache",
    short: "apache",
    blurb: ".htaccess, rewrite rules, mod_rewrite, mod_security, directories and MIME types.",
    icon: "apache",
    topics: [
      { label: ".htaccess errors (500 from the file itself)", slug: "/apache/htaccess" },
      { label: "Rewrite rules for WordPress", slug: "/apache/rewrite-rules" },
      { label: "mod_security blocking requests", slug: "/apache/mod-security" },
    ],
  },
  {
    id: "nginx",
    title: "NGINX & LiteSpeed",
    short: "nginx",
    blurb: "try_files, fastcgi timeouts, upstream 502/504, LiteSpeed cache rules.",
    icon: "nginx",
    topics: [
      { label: "WordPress try_files & rewrites", slug: "/nginx/wordpress-rewrites" },
      { label: "504 from fastcgi_read_timeout", slug: "/nginx/fastcgi-timeouts" },
      { label: "LiteSpeed cache conflicts", slug: "/nginx/litespeed-cache" },
      { label: "Redis object cache on the server", slug: "/nginx/redis" },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    short: "performance",
    blurb: "Caching, images, lazy loading, TTFB, Core Web Vitals, Query Monitor, object cache.",
    icon: "performance",
    topics: [
      { label: "Caching plugin not caching", slug: "/performance/caching-not-working" },
      { label: "Object cache (Redis / Memcached)", slug: "/performance/object-cache" },
      { label: "High TTFB investigation", slug: "/performance/ttfb" },
      { label: "Core Web Vitals regression", slug: "/performance/core-web-vitals" },
      { label: "Query Monitor workflow", slug: "/performance/query-monitor" },
      { label: "Image optimization & lazy loading", slug: "/performance/images" },
    ],
  },
  {
    id: "security",
    title: "Security",
    short: "security",
    blurb: "Malware, file permissions, brute force, backups, WAF, account recovery.",
    icon: "security",
    topics: [
      { label: "Malware cleanup", slug: "/security/malware-cleanup" },
      { label: "File permissions", slug: "/security/file-permissions" },
      { label: "Brute force & login hardening", slug: "/security/brute-force" },
      { label: "Backups & restore", slug: "/security/backups" },
      { label: "Google Safe Browsing / blacklist", slug: "/security/safe-browsing" },
      { label: "Hacked admin account recovery", slug: "/security/hacked-admin" },
    ],
  },
  {
    id: "migration",
    title: "Migration",
    short: "migration",
    blurb: "Move a full WordPress site between hosts, domains and environments — safely.",
    icon: "migration",
    topics: [
      { label: "Migrate a WordPress site end to end", slug: "/migration/migrate-wordpress-site" },
      { label: "Staging → production deploy", slug: "/migration/staging-to-production" },
      { label: "Domain change & redirects", slug: "/migration/domain-change" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    short: "deployment",
    blurb: "Git-based deploys, CI checks, release process for support-conscious teams.",
    icon: "deployment",
    topics: [
      { label: "Git workflow for WordPress", slug: "/deployment/git-workflow" },
      { label: "GitHub Actions deploy checks", slug: "/deployment/github-actions" },
    ],
  },
  {
    id: "runbooks",
    title: "Runbooks",
    short: "runbooks",
    blurb: "Step-by-step incident response. Numbered, copy-ready, timeboxed.",
    icon: "runbooks",
    topics: [
      { label: "WordPress site down", slug: "/runbooks/site-down" },
      { label: "Payment failure", slug: "/runbooks/payment-failure" },
      { label: "White screen", slug: "/runbooks/white-screen" },
      { label: "Plugin conflict", slug: "/runbooks/plugin-conflict" },
    ],
  },
  {
    id: "checklists",
    title: "Checklists",
    short: "checklists",
    blurb: "Pre-launch, migration, security, performance, WooCommerce, debug, incident response.",
    icon: "checklists",
    topics: [
      { label: "Pre-launch checklist", slug: "/checklists/pre-launch" },
      { label: "Migration checklist", slug: "/checklists/migration" },
      { label: "Security checklist", slug: "/checklists/security" },
      { label: "Performance checklist", slug: "/checklists/performance" },
      { label: "WooCommerce checklist", slug: "/checklists/woocommerce" },
      { label: "Debug checklist", slug: "/checklists/debug" },
      { label: "Incident response checklist", slug: "/checklists/incident-response" },
    ],
  },
  {
    id: "decision-trees",
    title: "Decision Trees",
    short: "decision-trees",
    blurb: "Interactive triage. Answer questions, get a narrowed diagnosis path.",
    icon: "decision-trees",
    topics: [
      { label: "Website down triage", slug: "/decision-trees/website-down" },
      { label: "Broken layout triage", slug: "/decision-trees/broken-layout" },
      { label: "Checkout failing triage", slug: "/decision-trees/checkout-failing" },
      { label: "Email not sending triage", slug: "/decision-trees/email-not-sending" },
    ],
  },
];

export const SUPPORT_WORKFLOW: { step: string; title: string; detail: string; icon: string }[] = [
  { step: "01", title: "Reproduce & scope", detail: "Confirm the symptom, browsers, users affected, last known good. Get URLs and timestamps.", icon: "reproduce" },
  { step: "02", title: "Collect evidence", detail: "debug.log, PHP error log, server access/error logs, browser console, Site Health report.", icon: "evidence" },
  { step: "03", title: "Enable logging safely", detail: "WP_DEBUG + WP_DEBUG_LOG on staging first. Never log to a public URL on production.", icon: "logging" },
  { step: "04", title: "Isolate the layer", detail: "Hosting → server (PHP/DB) → WordPress core → plugin → theme → integration → client cache.", icon: "isolate" },
  { step: "05", title: "Change one variable", detail: "One plugin, one theme switch, one constant at a time. Record every change as you go.", icon: "variable" },
  { step: "06", title: "Fix at the root", detail: "Patch the cause (code, config, limit, permissions), not the symptom.", icon: "fix" },
  { step: "07", title: "Verify & document", detail: "Re-test as different users, purge caches, log root cause and prevention for the next engineer.", icon: "verify" },
];

export const TOOLKIT = [
  { name: "Debugging", to: "/tag/debug", icon: "debug", blurb: "WP_DEBUG, logs, Query Monitor" },
  { name: "Logs", to: "/tag/logs", icon: "logs", blurb: "debug.log, PHP, server, LiteSpeed" },
  { name: "Hosting", to: "/hosting/cpanel", icon: "hosting", blurb: "cPanel, FTP, DNS, SSL, cron" },
  { name: "WooCommerce", to: "/woocommerce/payment-failed", icon: "woocommerce", blurb: "Payments, orders, emails" },
  { name: "Elementor", to: "/elementor/css-not-loading", icon: "elementor", blurb: "Safe mode, CSS, containers" },
  { name: "Performance", to: "/performance/object-cache", icon: "performance", blurb: "Cache, TTFB, CWV" },
  { name: "Security", to: "/security/file-permissions", icon: "security", blurb: "Malware, perms, brute force" },
  { name: "Cheat sheets", to: "/cheat-sheets", icon: "cheat-sheets", blurb: "WP-CLI, MySQL, NGINX, Git" },
];

export const OFFICIAL_RESOURCES: { group: string; links: { label: string; url: string; note: string }[] }[] = [
  {
    group: "WordPress",
    links: [
      { label: "Debugging in WordPress", url: "https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/", note: "WP_DEBUG, WP_DEBUG_LOG, WP_DEBUG_DISPLAY, SCRIPT_DEBUG" },
      { label: "Site Health", url: "https://developer.wordpress.org/advanced-administration/security/site-health/", note: "Debug information + recommended fixes" },
      { label: "Recovery Mode", url: "https://developer.wordpress.org/advanced-administration/security/recovery-mode/", note: "Admin access when plugins/themes fatal" },
      { label: "WP-Cron", url: "https://developer.wordpress.org/plugins/cron/", note: "Scheduled events, real cron vs WP-Cron" },
      { label: "WP-CLI commands", url: "https://developer.wordpress.org/cli/commands/", note: "plugin, db, cache, cron, search-replace" },
      { label: "Hardening WordPress", url: "https://developer.wordpress.org/advanced-administration/security/hardening/", note: "Permissions, salts, file editing" },
    ],
  },
  {
    group: "WooCommerce",
    links: [
      { label: "WooCommerce docs", url: "https://woocommerce.com/documentation/", note: "Checkout, orders, payments, shipping" },
      { label: "HPOS (custom order tables)", url: "https://woocommerce.com/document/high-performance-order-storage/", note: "Order storage migration, plugin compatibility" },
      { label: "Troubleshooting payment issues", url: "https://woocommerce.com/document/troubleshooting-payment-gateways/", note: "Gateway logs, sandbox mode" },
      { label: "System Status Report", url: "https://woocommerce.com/document/understanding-the-woocommerce-system-status-report/", note: "First artifact to request" },
    ],
  },
  {
    group: "Elementor",
    links: [
      { label: "Safe Mode", url: "https://elementor.com/help/safe-mode/", note: "Disable plugins/theme inside the editor" },
      { label: "CSS not loading / regenerate", url: "https://elementor.com/help/regenerate-css-data/", note: "Elementor → Tools → Regenerate CSS" },
      { label: "Containers & Flexbox", url: "https://elementor.com/help/flexbox-container/", note: "Layout model differences" },
    ],
  },
  {
    group: "PHP / MySQL",
    links: [
      { label: "PHP: error configuration", url: "https://www.php.net/manual/en/errorfunc.configuration.php", note: "log_errors, error_log, display_errors" },
      { label: "PHP: runtime configuration", url: "https://www.php.net/manual/en/ini.core.php", note: "memory_limit, upload_max_filesize, post_max_size" },
      { label: "MySQL: REPAIR TABLE", url: "https://dev.mysql.com/doc/refman/8.0/en/repair-table.html", note: "MyISAM repair (and when not to use it)" },
      { label: "MySQL: InnoDB recovery", url: "https://dev.mysql.com/doc/refman/8.0/en/innodb-recovery.html", note: "innodb_force_recovery for corrupt InnoDB" },
      { label: "phpMyAdmin docs", url: "https://docs.phpmyadmin.net/", note: "Export/import, SQL console, limits" },
    ],
  },
  {
    group: "Server",
    links: [
      { label: "Apache .htaccess", url: "https://httpd.apache.org/docs/2.4/howto/htaccess.html", note: "AllowOverride, directives, pitfalls" },
      { label: "NGINX + WordPress", url: "https://www.nginx.com/resources/wiki/start/topics/recipes/wordpress/", note: "try_files, fastcgi_pass, rewrites" },
      { label: "Cloudflare docs", url: "https://developers.cloudflare.com/", note: "Cache rules, flexible SSL, 5xx origin errors" },
      { label: "cPanel documentation", url: "https://docs.cpanel.net/", note: "File Manager, DNS Zone Editor, cron, PHP" },
    ],
  },
];
