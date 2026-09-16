export type ChecklistItem = { text: string; hint?: string };
export type ChecklistGroup = { group: string; items: ChecklistItem[] };
export type Checklist = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  when: string;
  min: number;
  groups: ChecklistGroup[];
};

export const CHECKLISTS: Checklist[] = [
  {
    id: "pre-launch",
    title: "Pre-launch checklist",
    blurb: "Run before the site goes live on the real domain. Every item here has caused a ticket.",
    icon: "pre-launch",
    when: "Before DNS cutover",
    min: 25,
    groups: [
      {
        group: "WordPress basics",
        items: [
          { text: "Search engine visibility allows indexing (Settings → Reading)", hint: "Uncheck 'Discourage search engines'." },
          { text: "Permalinks set to a non-default structure and saved" },
          { text: "Timezone, date and tagline correct" },
          { text: "Sample page/post, Hello Dolly, Akismet and unused themes deleted" },
          { text: "Admin email points to a monitored mailbox; default `admin` username removed" },
          { text: "Comments, registration and role defaults decided deliberately" },
        ],
      },
      {
        group: "Debug & config",
        items: [
          { text: "WP_DEBUG false on production; no debug.log or php error log left in webroot" },
          { text: "WP_DEBUG_LOG on staging only; log path outside a publicly reachable URL" },
          { text: "WP_ENVIRONMENT_TYPE set (`production`, `staging`, `local`)" },
          { text: "Salts regenerated, `wp-config.php` permissions 600/640" },
          { text: "Automatic updates policy decided (core minor, plugins, themes)" },
          { text: "AUTOMATIC_UPDATER_DISABLED / DISALLOW_FILE_EDIT set per policy" },
        ],
      },
      {
        group: "Performance",
        items: [
          { text: "Page cache + object cache active, cache purge tested" },
          { text: "Images compressed, WebP served, lazy loading verified" },
          { text: "Minified/critical CSS build tested with cache busted (hard reload)" },
          { text: "Query Monitor installed on staging: no slow query above ~100–200 ms" },
          { text: "PHP 8.x, OPcache enabled, memory_limit ≥ 256M" },
          { text: "CDN configured and purge verified after a content change" },
        ],
      },
      {
        group: "WooCommerce (if used)",
        items: [
          { text: "Test order placed online + offline with every gateway in sandbox first" },
          { text: "Transactional emails delivered (check SPF/DKIM and real inbox, not just 'sent')" },
          { text: "Tax, shipping zone and coupon rules verified with a calculated price" },
          { text: "Cart, checkout and 'thank you' pages rebuilt with correct shortcodes/blocks" },
          { text: "HPOS status checked (compatibility mode is not 'done')" },
        ],
      },
      {
        group: "Hosting & security",
        items: [
          { text: "DNS records reviewed: A/AAAA, CNAME, MX, TXT; TTL lowered before cutover" },
          { text: "SSL issued, forced HTTPS, no mixed content in console" },
          { text: "Backups automated, stored offsite, and a restore test completed" },
          { text: "Login hardening: rate limiting, 2FA, security headers, XML-RPC policy" },
          { text: "Monitoring/uptime alerts pointing at the right person" },
          { text: "Server logs rotating; .htaccess, wp-config and user.ini reviewed" },
        ],
      },
    ],
  },
  {
    id: "migration",
    title: "Migration checklist",
    blurb: "Host, domain, or staging→production. Do not improvise a migration on a Friday.",
    icon: "checklist-migration",
    when: "Any environment change",
    min: 18,
    groups: [
      {
        group: "Before",
        items: [
          { text: "Full backup: files + database, both, verified by opening the archive" },
          { text: "Capture current versions: WP, PHP, MySQL, plugins, theme (Site Health + `wp --info`)" },
          { text: "Lower DNS TTL to 300s at least 24h early" },
          { text: "Inventory: cron jobs, SMTP, CDN, webhooks, API keys, payment gateway callback URLs" },
          { text: "Note custom redirects, .htaccess rules, and server-only files (.user.ini, php.ini)" },
        ],
      },
      {
        group: "During",
        items: [
          { text: "Import files, then database, then fix wp-config (new DB credentials + salts)" },
          { text: "Search-replace URLs with `wp search-replace --all-tables --precise` (not raw SQL)" },
          { text: "Resave permalinks; flush object/page cache and OPcache" },
          { text: "Set correct ownership/permissions: files 644, dirs 755, wp-config 600" },
          { text: "Recreate cron jobs and update external callbacks (IPs, URLs, keys)" },
          { text: "Test with a hosts-file override before touching DNS" },
        ],
      },
      {
        group: "After",
        items: [
          { text: "Digital switch-over: DNS updated, old host kept warm for 72h as rollback" },
          { text: "Homepage, wp-admin login, one form, one checkout, one email — tested as a logged-out user" },
          { text: "SSL valid on www + non-www + any subdomain; HSTS plan agreed" },
          { text: "404/redirect map checked; old URLs return 301, not 404" },
          { text: "Search console / analytics property updated; sitemap resubmitted" },
          { text: "Document the new stack and close the migration ticket with the diff list" },
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security checklist",
    blurb: "Baseline hardening + the checks that actually find compromise.",
    icon: "checklist-security",
    when: "Quarterly + after any incident",
    min: 20,
    groups: [
      {
        group: "Accounts & access",
        items: [
          { text: "No shared logins; every admin has their own account with 2FA" },
          { text: "Least privilege: editors don't have admin; hosting panel accounts audited" },
          { text: "Password manager + unique password for DB, panel and SMTP" },
          { text: "Remove dormant accounts and revoke old application passwords / API keys" },
        ],
      },
      {
        group: "Server & app hardening",
        items: [
          { text: "Files 644 / dirs 755 / wp-config 600; no 777 anywhere" },
          { text: "DISALLOW_FILE_EDIT true; file editing disabled in the filesystem layer" },
          { text: "Login rate limiting or WAF for wp-login.php and xmlrpc.php" },
          { text: "Security headers: HSTS, X-Content-Type-Options, Referrer-Policy, CSP plan" },
          { text: "XML-RPC disabled unless a client genuinely needs it" },
          { text: "Database user has no global privileges, only this database" },
        ],
      },
      {
        group: "Detection & recovery",
        items: [
          { text: "Malware scan + file-integrity check run (core, theme, uploads for .php)" },
          { text: "Scheduled backups verified: offsite, versioned, restore tested" },
          { text: "Logs retained 30+ days and reviewed for 4xx/5xx spikes and odd POSTs" },
          { text: "Uptime + file-change monitoring with alerts going to a human" },
          { text: "Incident response plan with roles, contacts and 24h/72h obligations" },
        ],
      },
    ],
  },
  {
    id: "performance",
    title: "Performance checklist",
    blurb: "From a measured TTFB to a passing Web Vitals report — in order.",
    icon: "checklist-performance",
    when: "Slow site tickets",
    min: 16,
    groups: [
      {
        group: "Measure first",
        items: [
          { text: "Record baseline: TTFB, LCP, CLS, INP from PageSpeed Insights + server timing" },
          { text: "Install Query Monitor on staging; note slow queries, HTTP API calls, hooks" },
          { text: "Check `admin-ajax.php` and REST traffic during a real page view" },
        ],
      },
      {
        group: "Server & cache",
        items: [
          { text: "PHP 8.x + OPcache enabled with adequate memory" },
          { text: "Object cache (Redis/Memcached) configured and verified as a drop-in" },
          { text: "Page cache hit ratio ≥ 90% for anonymous traffic; logged-in bypass understood" },
          { text: "CDN in front, HTML not cached when it must not be (cart/checkout)" },
          { text: "MySQL: slow query log reviewed; missing indexes added; InnoDB buffer pool sized" },
        ],
      },
      {
        group: "Frontend & content",
        items: [
          { text: "Images resized to display size, modern formats, width/height set (no CLS)" },
          { text: "Lazy loading below the fold; hero image preloaded, not lazy" },
          { text: "Third-party scripts audited: analytics, chat, fonts, maps — defer or remove" },
          { text: "Critical CSS inlined, unused CSS trimmed, JS bundled and split across pages" },
          { text: "Document results and the fix that moved the number so it can't regress silently" },
        ],
      },
    ],
  },
  {
    id: "woocommerce",
    title: "WooCommerce checklist",
    blurb: "Store configuration review — run it before blaming a plugin.",
    icon: "checklist-woocommerce",
    when: "Before launch + quarterly",
    min: 18,
    groups: [
      {
        group: "Store setup",
        items: [
          { text: "Store address, currency and selling/shipping locations correct" },
          { text: "Taxes: prices include/exclude tax, rates, and tax classes verified with a test order" },
          { text: "Shipping zones, methods and free-shipping thresholds produce the expected cost" },
          { text: "Pages assigned: cart, checkout, my account, terms; all render correctly" },
          { text: "HPOS enabled or the compatibility fallback is documented" },
        ],
      },
      {
        group: "Checkout & payments",
        items: [
          { text: "Every gateway tested in test mode, then a live low-value order" },
          { text: "Webhook/callback URL reachable from the internet (not blocked by WAF or basic auth)" },
          { text: "Order status transitions verified: pending → processing → completed" },
          { text: "Failed-order handling and customer retry path documented" },
        ],
      },
      {
        group: "Emails & comms",
        items: [
          { text: "SMTP or transactional API configured; SPF, DKIM and DMARC pass" },
          { text: "Test order, refund and password-reset emails received in a real inbox (not spam)" },
          { text: "From-name/address valid for the domain; reply-to monitored" },
        ],
      },
      {
        group: "Ops",
        items: [
          { text: "Cart/checkout excluded from page cache and CDN HTML cache" },
          { text: "Scheduled actions running (Action Scheduler queue empty, cron healthy)" },
          { text: "Order data retention and privacy export/erase tools configured" },
          { text: "WooCommerce System Status Report reviewed line by line and archived" },
        ],
      },
    ],
  },
  {
    id: "debug",
    title: "Debug checklist",
    blurb: "The safe order to turn logging on, isolate, and turn it back off.",
    icon: "debug",
    when: "Any debugging session",
    min: 14,
    groups: [
      {
        group: "Prepare",
        items: [
          { text: "Work on staging or a clone. If that is impossible, sign off on production rules" },
          { text: "Take a database + files snapshot before changing anything" },
          { text: "Write down current versions and the exact reproduction steps" },
        ],
      },
      {
        group: "Instrument",
        items: [
          { text: "WP_DEBUG true + WP_DEBUG_LOG true + WP_DEBUG_DISPLAY false on staging" },
          { text: "Add WP_DEBUG_LOG path outside webroot when the host allows it" },
          { text: "Set WP_ENVIRONMENT_TYPE staging to make WP_DEBUG_DISPLAY survivable" },
          { text: "Enable error_log / display_errors off in php.ini or .user.ini, not inline in PHP files" },
          { text: "Install Query Monitor for hooks, queries, HTTP calls and PHP notices" },
        ],
      },
      {
        group: "Isolate",
        items: [
          { text: "Deactivate plugins one at a time (or use a conflict test plugin on staging)" },
          { text: "Switch to a default theme (Twenty Twenty-*); check the layout afterwards" },
          { text: "If wp-admin is unusable, use Recovery Mode or rename the offending folder via FTP" },
          { text: "Compare behaviour with a fresh incognito session and cache disabled" },
        ],
      },
      {
        group: "Close out",
        items: [
          { text: "Remove debug constants, delete debug.log, delete test plugins and test users" },
          { text: "Re-enable caching/security layers that were switched off during the test" },
          { text: "Document root cause + prevention in the ticket and in this KB" },
        ],
      },
    ],
  },
  {
    id: "incident-response",
    title: "Incident response checklist",
    blurb: "Site down, hacked, or payments failing. Communication matters as much as the fix.",
    icon: "incident-response",
    when: "Severity-1 incidents",
    min: 16,
    groups: [
      {
        group: "First 10 minutes",
        items: [
          { text: "Declare the incident: one owner, one channel, one timeline document" },
          { text: "Capture the state: HTTP status per URL, screenshots, curl headers, log snippets" },
          { text: "Stop the bleeding: maintenance page or WAF rule if data/payments are at risk" },
          { text: "Status page / stakeholder notice with next-update time" },
        ],
      },
      {
        group: "Diagnose & mitigate",
        items: [
          { text: "Triage by layer: DNS → network/CDN → web server → PHP → DB → WordPress → plugin" },
          { text: "Check `error_log` and access log for the 5-minute window before the incident" },
          { text: "Roll back the most recent change first (deploy, update, config, DNS)" },
          { text: "If credentials are suspect: rotate salts, passwords, API keys, then investigate" },
          { text: "Prefer restore-from-backup over in-place surgery when data integrity is unclear" },
        ],
      },
      {
        group: "Recover & learn",
        items: [
          { text: "Verify recovered: login, forms, checkout, emails, cron, search, feed" },
          { text: "Resume monitoring, confirm no 5xx in the log for 30 min" },
          { text: "Post-incident review within 48h: timeline, root cause, prevention owners" },
          { text: "Convert the findings into a KB article or runbook update" },
        ],
      },
    ],
  },
];
