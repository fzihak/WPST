export type TreeOutcome = {
  label: string;
  verdict: string;
  severity: "ok" | "warn" | "bad";
  actions: string[];
  link?: string;
};
export type TreeNode = {
  id: string;
  question: string;
  hint?: string;
  /** label -> node id (prefix "q:") or outcome key (prefix "o:") */
  options: { label: string; go: string }[];
  outcome?: never;
};
export type DecisionTree = {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  start: string;
  nodes: TreeNode[];
  outcomes: Record<string, TreeOutcome>;
};

export const DECISION_TREES: DecisionTree[] = [
  {
    id: "website-down",
    title: "Website down triage",
    icon: "website-down",
    blurb: "Start here when the site does not load. Layer by layer, CDN to database.",
    start: "n1",
    nodes: [
      {
        id: "n1",
        question: "Can you reach wp-admin (/wp-admin/)?",
        hint: "Test in a private window with caches off.",
        options: [
          { label: "Yes, admin loads fine", go: "o:frontend-only" },
          { label: "No — admin is broken too", go: "n2" },
          { label: "Redirects to another URL", go: "o:redirect-loop" },
        ],
      },
      {
        id: "n2",
        question: "What HTTP status does curl return for the homepage?",
        options: [
          { label: "500 Internal Server Error", go: "n3" },
          { label: "503 / 502 / 504 from the CDN or proxy", go: "n4" },
          { label: "403 Forbidden", go: "o:forbidden" },
          { label: "200 but empty body (white screen)", go: "o:wsod" },
          { label: "Timeout / connection refused", go: "n5" },
        ],
      },
      {
        id: "n3",
        question: "What does the PHP error log say for that timestamp?",
        options: [
          { label: "'Allowed memory size ... exhausted'", go: "o:memory" },
          { label: "'Error establishing a database connection'", go: "o:database" },
          { label: "Fatal in a plugin or theme file", go: "o:plugin-fatal" },
          { label: "Message mentions .htaccess or 'infinite recursion'", go: "o:htaccess" },
        ],
      },
      {
        id: "n4",
        question: "Does the site load when you bypass the CDN/proxy?",
        hint: "Grey-cloud the DNS record or curl the origin IP directly.",
        options: [
          { label: "Loads fine at origin", go: "o:cdn" },
          { label: "Also fails at origin", go: "n5" },
        ],
      },
      {
        id: "n5",
        question: "Can wp-cli or the panel reach MySQL?",
        options: [
          { label: "MySQL is down / refusing connections", go: "o:database-down" },
          { label: "DB is up, but PHP-FPM/worker limits are maxed", go: "o:resources" },
          { label: "Everything at server level looks healthy", go: "o:plugin-isolate" },
        ],
      },
    ],
    outcomes: {
      "frontend-only": {
        label: "Frontend-only failure",
        verdict: "Theme or page-cache layer — core and admin work.",
        severity: "warn",
        actions: [
          "Activate a default theme on staging with the same plugin set",
          "Purge page cache + CDN and test with ?nocache=1",
          "Check template files modified in the last 24h (find -newermt)",
          "Test with all plugins active and a default theme before blaming the theme",
        ],
        link: "/themes/broken-layout",
      },
      "redirect-loop": {
        label: "Redirect loop / unexpected redirect",
        verdict: "URL configuration mismatch (siteurl/home, SSL, proxies).",
        severity: "warn",
        actions: [
          "Compare `wp option get siteurl` with `home`",
          "Check SSL mode at the CDN (Flexible + forced HTTPS = loop)",
          "Inspect the .htaccess WordPress block for duplicate redirect rules",
          "Look for a redirect plugin or hosting-level 'force https' rule doubling up",
        ],
        link: "/errors/err-too-many-redirects",
      },
      forbidden: {
        label: "403 Forbidden",
        verdict: "Access control: permissions, .htaccess, mod_security, or WAF.",
        severity: "warn",
        actions: [
          "Check file/directory modes (755/644, 600 for wp-config)",
          "Review .htaccess deny rules and the host's IP deny lists",
          "Check mod_security / WAF logs for the blocked rule ID",
          "Confirm the account is not suspended for resources or abuse",
        ],
        link: "/errors/403-forbidden",
      },
      wsod: {
        label: "White screen of death",
        verdict: "PHP fatal — find the file and line in the error log.",
        severity: "bad",
        actions: [
          "Read php_error.log for the first fatal, not the last one",
          "Disable the suspect plugin or switch theme to confirm",
          "Use Recovery Mode if wp-admin is also blank",
          "Check for a half-written file from an interrupted update",
        ],
        link: "/errors/white-screen-of-death",
      },
      memory: {
        label: "PHP memory exhausted",
        verdict: "A single request needs more memory than PHP allows.",
        severity: "bad",
        actions: [
          "Raise memory_limit to 256M/512M and re-test",
          "Identify the call site in the stack trace (often an import or a builder)",
          "Disable the heavy page while the root cause is fixed",
          "Check for a runaway loop or a huge autoloaded option",
        ],
        link: "/errors/allowed-memory-size-exhausted",
      },
      database: {
        label: "Database connection error",
        verdict: "Credentials, MySQL service, or max connections.",
        severity: "bad",
        actions: [
          "Verify DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in wp-config.php",
          "Test `mysql -u user -p -e 'SELECT 1'` from the server",
          "Check MySQL process list for stuck queries and max_connections",
          "Confirm the DB user is not locked out by the host's IP restrictions",
        ],
        link: "/errors/error-establishing-database-connection",
      },
      "plugin-fatal": {
        label: "Plugin / theme fatal error",
        verdict: "Code-level failure — isolate to one plugin, then one version.",
        severity: "bad",
        actions: [
          "Note the plugin, file and line from the fatal message",
          "Update the plugin; check the changelog for PHP 8 notes",
          "If the update is the cause, roll back to the previous version",
          "Report upstream with the stack trace and WordPress/PHP versions",
        ],
        link: "/plugins/plugin-fatal-error",
      },
      htaccess: {
        label: ".htaccess / rewrite problem",
        verdict: "Server configuration, not WordPress code.",
        severity: "warn",
        actions: [
          "Rename .htaccess and retest — if fixed, rebuild the WordPress block only",
          "Check for `AllowOverride None` or missing mod_rewrite",
          "Rebuild permalinks after restoring the file",
          "Watch for PHP directives inside .htaccess on PHP-FPM hosts",
        ],
        link: "/apache/htaccess",
      },
      cdn: {
        label: "CDN / proxy layer",
        verdict: "Origin is healthy — the edge is the problem.",
        severity: "warn",
        actions: [
          "Read the CDN error code (520/521/522/524) and the origin log for the same second",
          "Check SSL mode and origin certificate validity",
          "Purge the edge cache for the affected URLs, then the whole zone",
          "Temporarily grey-cloud one record to keep serving while you fix the edge config",
        ],
        link: "/errors/502-bad-gateway",
      },
      "database-down": {
        label: "MySQL service unavailable",
        verdict: "Hosting-level DB outage or resource exhaustion.",
        severity: "bad",
        actions: [
          "Open a host ticket with timestamps and the exact error string",
          "Check disk space and inode usage — a full disk stops MySQL writes",
          "Look for a runaway query or a cron job importing data",
          "If data corruption is suspected, snapshot the DB before any repair",
        ],
        link: "/mysql/database-repair",
      },
      resources: {
        label: "Resource exhaustion (PHP-FPM / workers)",
        verdict: "Requests are queued: memory, CPU, connections or pm.max_children.",
        severity: "bad",
        actions: [
          "Check concurrent PHP-FPM children and CPU load during impact",
          "Scan for bots or a scraping spike in the access log",
          "Add a CDN/WAF rule to shed anonymous load",
          "Increase pm.max_children / memory only after sizing the box",
        ],
        link: "/performance/ttfb",
      },
      "plugin-isolate": {
        label: "WordPress layer isolation needed",
        verdict: "Server healthy, status unclear — isolate plugins and theme.",
        severity: "warn",
        actions: [
          "Deactivate all plugins, then re-enable half at a time",
          "Switch to a default theme and retest",
          "Enable WP_DEBUG_LOG and reproduce once, on staging",
          "Compare the failing request with a known-good server (staging clone)",
        ],
        link: "/plugins/plugin-conflict",
      },
    },
  },
  {
    id: "broken-layout",
    title: "Broken layout triage",
    icon: "broken-layout",
    blurb: "Site loads but looks wrong. Usually CSS delivery, cache, or a builder's generated assets.",
    start: "b1",
    nodes: [
      {
        id: "b1",
        question: "Does the page render properly in a private window with DevTools → Disable cache?",
        options: [
          { label: "Yes, it looks fine", go: "o:browser-cache" },
          { label: "No — still broken", go: "b2" },
        ],
      },
      {
        id: "b2",
        question: "In the Network tab, is the main stylesheet (style.css / theme.css / post-*.css) requested?",
        options: [
          { label: "Request is missing entirely", go: "o:not-enqueued" },
          { label: "Requested but returns 404", go: "o:404-asset" },
          { label: "Loads with 200 but the page looks unstyled", go: "o:css-conflict" },
        ],
      },
      {
        id: "b3",
        question: "Is a page builder (Elementor / WPBakery / Divi) in use?",
        options: [
          { label: "Yes, Elementor", go: "o:elementor-css" },
          { label: "Yes, another builder", go: "o:builder-generic" },
          { label: "No builder", go: "o:not-enqueued" },
        ],
      },
    ],
    outcomes: {
      "browser-cache": {
        label: "Client/browser cache",
        verdict: "Stale CSS or JS in the browser or an intermediate cache.",
        severity: "ok",
        actions: [
          "Hard reload and confirm in a fresh private window",
          "Purge page cache + CDN; check the cache key includes the asset",
          "Ask the site owner to test on mobile data (bypasses local proxy)",
        ],
        link: "/performance/caching-not-working",
      },
      "not-enqueued": {
        label: "Stylesheet never enqueued",
        verdict: "wp_enqueue_style missing, a conditional failing, or an optimisation plugin dropping assets.",
        severity: "warn",
        actions: [
          "Check the theme's functions.php for wp_enqueue_style and the handle",
          "Look for conditional enqueues tied to templates or post types",
          "Disable the minify/combine plugin and retest immediately",
          "Check for an optimization plugin excluding the URL or handle",
        ],
        link: "/themes/broken-layout",
      },
      "404-asset": {
        label: "Asset 404",
        verdict: "File missing, wrong path, or the file was removed by an optimiser/security scan.",
        severity: "warn",
        actions: [
          "Verify the file exists on disk with the exact case (Linux is case-sensitive)",
          "Check the asset URL host (http vs https, www vs non-www)",
          "Restore the missing file from the theme package or backup",
          "Look for a security plugin that quarantined unknown PHP/JS files",
        ],
        link: "/errors/404-not-found",
      },
      "css-conflict": {
        label: "CSS conflict / override",
        verdict: "Another stylesheet is winning specificity, or the builder's CSS is missing.",
        severity: "warn",
        actions: [
          "Use DevTools to inspect which rules are applying and who wins",
          "Disable plugins one by one to find the stylesheet injected afterwards",
          "Check 'Inline CSS' / 'Optimized CSS' options in the cache plugin",
          "Test with the theme's own CSS only (default theme) to confirm",
        ],
        link: "/themes/broken-layout",
      },
      "elementor-css": {
        label: "Elementor generated CSS",
        verdict: "post-*.css / global CSS is stale or deleted.",
        severity: "ok",
        actions: [
          "Elementor → Tools → Regenerate CSS & Data",
          "Elementor → Tools → Safe Mode to test without plugins/theme",
          "Check the uploads/elementor/css directory is writable",
          "Verify no optimization plugin is combining/removing Elementor files",
        ],
        link: "/elementor/css-not-loading",
      },
      "builder-generic": {
        label: "Builder cache/dependency",
        verdict: "Builder-specific generated assets or a dependency library failed to load.",
        severity: "warn",
        actions: [
          "Clear the builder's own cache and regenerate assets",
          "Check the builder's System Status / compatibility report",
          "Verify jQuery and its migrate build are loaded exactly once",
          "Update builder + theme together, never one of the pair alone",
        ],
        link: "/plugins/plugin-conflict",
      },
    },
  },
  {
    id: "checkout-failing",
    title: "Checkout failing triage",
    icon: "checkout-failing",
    blurb: "Add-to-cart works, paying does not. Gateway, webhook, cache or JS.",
    start: "c1",
    nodes: [
      {
        id: "c1",
        question: "Does the checkout page load at all?",
        options: [
          { label: "Page is blank or 500s", go: "o:checkout-500" },
          { label: "Loads, but placing the order does nothing / spinner", go: "c2" },
          { label: "Order is created but status = failed", go: "o:payment-failed" },
        ],
      },
      {
        id: "c2",
        question: "Console + Network: does admin-ajax.php / wc-ajax return an error?",
        options: [
          { label: "403 or 401 on the AJAX call", go: "o:security-block" },
          { label: "500 with an empty response", go: "o:checkout-500" },
          { label: "200 but the cart total is stale", go: "o:cache-nonce" },
        ],
      },
      {
        id: "c3",
        question: "Is the problem the same in the store's test mode gateway?",
        options: [
          { label: "Test mode works, live fails", go: "o:gateway-account" },
          { label: "Both fail identically", go: "o:checkout-500" },
        ],
      },
    ],
    outcomes: {
      "checkout-500": {
        label: "Server-side checkout error",
        verdict: "PHP fatal or a plugin conflict inside the checkout request.",
        severity: "bad",
        actions: [
          "Read debug.log for the fatal at the exact checkout timestamp",
          "Isolate plugins using the halving method on staging",
          "Check for HPOS incompatibility in the payment plugin",
          "Test with cart/checkout pages rebuilt using the current shortcodes or blocks",
        ],
        link: "/woocommerce/checkout-broken",
      },
      "payment-failed": {
        label: "Payment declined / failed",
        verdict: "Gateway-side rejection or a callback that never completed.",
        severity: "bad",
        actions: [
          "Check WooCommerce → Status → Logs for the gateway source",
          "Compare with the gateway dashboard event for the same order ID",
          "Test the webhook URL from the public internet",
          "Never ask the customer for card details — use gateway-side references only",
        ],
        link: "/woocommerce/payment-failed",
      },
      "security-block": {
        label: "WAF / security plugin blocking checkout",
        verdict: "A firewall rule or nonce check is rejecting the request.",
        severity: "warn",
        actions: [
          "Whitelist wc-ajax and admin-ajax for logged-out users in the WAF",
          "Check security plugin logs for the blocked request and rule ID",
          "Verify the site's nonce/cookie domain matches (www + Cloudflare)",
          "Test with the security plugin disabled on staging only",
        ],
        link: "/security/brute-force",
      },
      "cache-nonce": {
        label: "Cached cart/checkout page",
        verdict: "Nonces and fragments are being served from cache.",
        severity: "warn",
        actions: [
          "Exclude /cart, /checkout, /my-account from page cache and CDN",
          "Ensure the cache bypasses on the wordpress_logged_in_* and woocommerce_cart_hash cookies",
          "Purge everything and test in a fresh session",
          "Verify no HTML cache is enabled for WooCommerce pages in the CDN",
        ],
        link: "/woocommerce/cart-session-lost",
      },
      "gateway-account": {
        label: "Live gateway configuration",
        verdict: "Account-level: keys, currency, account status or mode.",
        severity: "bad",
        actions: [
          "Confirm live API keys (not sandbox) and the matching webhook secret",
          "Check the gateway account for holds, verification or currency restrictions",
          "Confirm the statement descriptor and required business details are set",
          "Keep a secondary gateway available for business-critical hours",
        ],
        link: "/woocommerce/payment-failed",
      },
    },
  },
  {
    id: "email-not-sending",
    title: "Email not sending triage",
    icon: "email-not-sending",
    blurb: "Customers and admins never receive WordPress or WooCommerce email.",
    start: "e1",
    nodes: [
      {
        id: "e1",
        question: "Do WordPress admin emails (password reset) arrive?",
        options: [
          { label: "No WordPress email arrives at all", go: "e2" },
          { label: "Admin emails work, order emails do not", go: "o:woo-config" },
        ],
      },
      {
        id: "e2",
        question: "Is an SMTP plugin or transactional email API configured?",
        options: [
          { label: "No — using PHP mail() only", go: "o:php-mail" },
          { label: "Yes, SMTP/API is configured", go: "o:smtp-debug" },
        ],
      },
      {
        id: "e3",
        question: "Does the email log show the message as 'sent'?",
        hint: "Most SMTP plugins have a log with error responses.",
        options: [
          { label: "Logged as failed with an API/SMTP error", go: "o:smtp-debug" },
          { label: "Logged as sent, but never delivered", go: "o:deliverability" },
        ],
      },
    ],
    outcomes: {
      "php-mail": {
        label: "Using PHP mail()",
        verdict: "Unreliable and almost certainly spam-filtered or dropped by the host.",
        severity: "bad",
        actions: [
          "Install an SMTP or transactional API integration immediately",
          "Authenticate the sending domain (SPF, DKIM, DMARC)",
          "Set a From address on the site's own domain, never a free mailbox",
          "Send a test and confirm the headers show the authenticated domain",
        ],
        link: "/woocommerce/order-emails-not-sending",
      },
      "smtp-debug": {
        label: "SMTP / API credential failure",
        verdict: "Wrong credentials, port blocked, or a rejected sender.",
        severity: "warn",
        actions: [
          "Re-run the plugin's connection test and read the exact error code",
          "Try port 587 with TLS and 465 with SSL; some hosts block 25 entirely",
          "Confirm the sending domain is verified with the provider",
          "Check for 2FA/API-key expiry on the mailbox used for SMTP",
        ],
        link: "/woocommerce/order-emails-not-sending",
      },
      deliverability: {
        label: "Deliverability (sent ≠ delivered)",
        verdict: "Provider accepted the message; the receiving side filtered it.",
        severity: "warn",
        actions: [
          "Verify SPF, DKIM and DMARC with a checker on the sending domain",
          "Check the provider's suppression list and reputation dashboard",
          "Send to a Gmail address and inspect the raw headers + spam score",
          "Avoid link-shorteners and image-only emails that trigger filters",
        ],
        link: "/woocommerce/order-emails-not-sending",
      },
      "woo-config": {
        label: "WooCommerce email settings",
        verdict: "Emails disabled, wrong recipient, or a mailer conflict.",
        severity: "ok",
        actions: [
          "WooCommerce → Settings → Emails: confirm each email is enabled",
          "Check the recipient addresses and per-product/vendor overrides",
          "Confirm only one SMTP plugin is active (two = silent failure)",
          "Trigger a real test order and follow it in the email log end to end",
        ],
        link: "/woocommerce/order-emails-not-sending",
      },
    },
  },
];
