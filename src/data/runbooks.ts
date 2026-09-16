export type RunbookStep = {
  title: string;
  detail: string;
  timebox: string;
  commands?: string[];
  lookFor?: string;
};

export type Runbook = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  severity: "P1 — Critical" | "P2 — High" | "P3 — Normal";
  trigger: string;
  firstResponse: string;
  steps: RunbookStep[];
  escalateWhen: string[];
  related: string[];
};

export const RUNBOOKS: Runbook[] = [
  {
    id: "site-down",
    title: "WordPress site down",
    blurb: "T-0 workflow when the site returns 5xx/timeout for everyone. Keep it boring and ordered.",
    icon: "site-down",
    severity: "P1 — Critical",
    trigger: "Site returns 5xx, times out, or serves a blank page for all visitors.",
    firstResponse: "Acknowledge in the incident channel with the exact URL + status code + timestamp (UTC) and the next update time.",
    steps: [
      {
        title: "Confirm it is really down",
        detail:
          "Test from outside your network with a cache-buster. Check two URLs (homepage + a static asset) and note the HTTP status and headers.",
        timebox: "2 min",
        commands: [
          "curl -sS -o /dev/null -w '%{http_code} %{time_total}s\\n' https://example.com/?nocache=1",
          "curl -sSI https://example.com | head -20",
          "curl -sS https://example.com | head -c 400",
        ],
        lookFor: "Status code, server header (origin vs CDN), time_total, any maintenance page or WAF block page.",
      },
      {
        title: "Split CDN / DNS from origin",
        detail:
          "If a CDN is in front, treat it as a suspect layer: check its dashboard for errors and, if safe, test the origin directly. Confirm DNS resolution matches the host's IP.",
        timebox: "3 min",
        commands: ["dig +short example.com A", "dig +short example.com NS", "curl --resolve example.com:443:ORIGIN_IP https://example.com/ -I"],
        lookFor: "Wrong/old IP, propagation in progress, CDN error 521/522/524, SSL mode mismatch.",
      },
      {
        title: "Read the logs for the incident window",
        detail:
          "Access log for status codes and top URLs, error log for PHP fatals, host-level log for OOM kills or disk-full. Look at the 5 minutes BEFORE impact.",
        timebox: "5 min",
        commands: [
          "tail -n 200 /home/user/logs/php_error.log",
          "awk '{print $9}' access.log | sort | uniq -c | sort -rn | head",
          "grep -i 'fatal\\|out of memory\\|disk full' error_log | tail -30",
        ],
        lookFor: "First fatal error timestamp, a single repeated fatal, memory exhaustion, disk full, MySQL gone away.",
      },
      {
        title: "Check database availability",
        detail:
          "Most 'site down' incidents end here. Verify MySQL responds, the DB user/credentials work, and the server is not maxed out on connections or disk.",
        timebox: "4 min",
        commands: [
          "wp db check --path=/home/user/public_html",
          "mysql -u dbuser -p -e 'SELECT 1'",
          "df -h && free -m",
        ],
        lookFor: "'Too many connections', 'Access denied', 'Can't connect to local MySQL server', 100% inode/disk usage.",
      },
      {
        title: "Isolate WordPress layer if infra is healthy",
        detail:
          "Only when hosting is confirmed healthy: disable plugins (wp-cli or FTP rename), then switch to a default theme. If the site returns, re-enable one at a time.",
        timebox: "8 min",
        commands: ["wp plugin deactivate --all", "wp theme activate twentytwentyfour", "wp plugin list --status=active"],
        lookFor: "Which single plugin/theme toggles the outage. Record the plugin version.",
      },
      {
        title: "Restore, then fix the cause",
        detail:
          "If the change is unknown and the site must be up: restore the last known-good backup or roll back the last deploy. Do root-cause analysis afterwards, not during.",
        timebox: "15+ min",
        commands: ["wp db import backup-2026-01-17.sql", "git revert <last-deploy-sha>"],
        lookFor: "Working login, one form submit, one checkout if WooCommerce, one email.",
      },
      {
        title: "Verify and communicate",
        detail:
          "Post the RCA summary: what broke, from when to when, how many users affected, what fixed it, what prevents a repeat. Update the ticket and add a KB entry.",
        timebox: "10 min",
        commands: ["curl -sS -o /dev/null -w '%{http_code}\\n' https://example.com/checkout/"],
        lookFor: "No 5xx for 30 minutes, caches purged, monitoring alert cleared.",
      },
    ],
    escalateWhen: [
      "Host-level outage or hardware/storage failure confirmed",
      "Database corruption or a suspected compromise (rotate credentials first)",
      "Payments are failing during business hours with real revenue impact",
      "No root cause within your SLA window — hand off with the log snippets and timings",
    ],
    related: ["/errors/500-internal-server-error", "/errors/error-establishing-database-connection", "/runbooks/white-screen"],
  },
  {
    id: "payment-failure",
    title: "Payment failure",
    blurb: "A customer cannot complete payment, or orders land in 'failed' with no clear reason.",
    icon: "payment-failure",
    severity: "P1 — Critical",
    trigger: "Checkout returns to the order-received page with 'failed', gateway declines valid cards, or webhooks stop arriving.",
    firstResponse: "Get the order ID, gateway, amount, timestamp, customer country and the exact error text shown. Never ask for full card data.",
    steps: [
      {
        title: "Reproduce with the store's test credentials",
        detail:
          "Place a test order with the same gateway in sandbox mode. If it succeeds, the problem is account-side (gateway config, live keys, restrictions) rather than code.",
        timebox: "5 min",
        lookFor: "Same error or different error — this decides the whole path.",
      },
      {
        title: "Read the gateway and WooCommerce logs together",
        detail:
          "WooCommerce → Status → Logs → filter by the gateway source. Compare the timestamp with the order notes and the gateway's own dashboard event log.",
        timebox: "5 min",
        commands: ["wp option get woocommerce_gateway_order_paypal --format=json | head -c 400"],
        lookFor: "401/403 from the gateway API, invalid signature, currency not enabled, missing webhook secret, timeout.",
      },
      {
        title: "Verify the callback path end to end",
        detail:
          "Many 'failed' orders are successful charges whose webhook never arrived. Test the webhook URL from the public internet, not from inside the network.",
        timebox: "6 min",
        commands: [
          "curl -I https://example.com/?wc-api=WC_Gateway_PayPal",
          "curl -X POST https://example.com/wp-json/wc/v3/orders -I",
        ],
        lookFor: "WAF/security plugin blocking POST, basic auth prompt, 301 redirect on the callback URL, 403 from a firewall rule.",
      },
      {
        title: "Check inventory, tax and totals logic",
        detail:
          "A mismatch between cart total and gateway total rejects payment. Test with a simple single-variation product to rule out the product setup.",
        timebox: "4 min",
        lookFor: "Price calculated on the server ≠ gateway amount, coupon rounding, currency switcher plugin, shipping recalculation.",
      },
      {
        title: "Reconcile orders afterwards",
        detail:
          "For every affected order: check the gateway dashboard. If the charge exists, do not re-charge — update the order status manually or trigger the gateway's 'capture/sync' action and note it in the order.",
        timebox: "as needed",
        commands: ["wp wc order list --status=failed --user=1 --fields=id,date_created,total"],
        lookFor: "Charged-but-failed orders that must be marked processing manually; refunds needed for duplicates.",
      },
      {
        title: "Close the loop with the cause",
        detail:
          "Document which layer failed (gateway account, plugin version, firewall, code) and add monitoring so the next occurrence pages within minutes rather than days.",
        timebox: "10 min",
        lookFor: "Alert on failed-order count per hour and on webhook 4xx/5xx rate.",
      },
    ],
    escalateWhen: [
      "Charges exist without orders — money taken, no fulfilment",
      "The gateway reports an account/merchant issue you cannot fix from the store",
      "PCI or cardholder data appears in logs, emails or tickets",
    ],
    related: ["/woocommerce/payment-failed", "/woocommerce/checkout-broken", "/woocommerce/order-emails-not-sending"],
  },
  {
    id: "white-screen",
    title: "White screen of death",
    blurb: "HTTP 200 but a blank page — almost always a PHP fatal in a plugin, theme or file edit.",
    icon: "white-screen",
    severity: "P2 — High",
    trigger: "Blank page for frontend and/or wp-admin, no error text, usually after an update or a code change.",
    firstResponse: "Ask what changed in the last 24 hours: updates, file edits, new plugin, PHP version bump.",
    steps: [
      {
        title: "Confirm the symptom precisely",
        detail: "Blank means empty body with 200, not a 500 page and not a redirect to a blank URL.",
        timebox: "1 min",
        commands: ["curl -sS -o /dev/null -w '%{http_code} %{size_download} bytes\\n' https://example.com/"],
        lookFor: "200 with size_download 0 → PHP died. 302 → not a WSOD, go to redirect troubleshooting.",
      },
      {
        title: "Read the PHP error log",
        detail: "The fatal is always written somewhere. If the host exposes logs in the panel, use them; otherwise point error_log at a path you can read.",
        timebox: "3 min",
        commands: ["tail -n 80 php_error.log", "grep -i fatal php_error.log | tail -5"],
        lookFor: "`PHP Fatal error: Uncaught Error` with a file path and line number inside wp-content.",
      },
      {
        title: "Get into wp-admin the safe way",
        detail:
          "If wp-admin is also blank, either (a) rename the plugin/theme folder over FTP, or (b) let WordPress fall back into Recovery Mode from the e-mail it sends after a fatal in a plugin/theme.",
        timebox: "4 min",
        commands: ["mv wp-content/plugins/suspect-plugin wp-content/suspect-plugin.off"],
        lookFor: "Site returns with the plugin disabled → root cause confirmed at that plugin.",
      },
      {
        title: "Check recent file edits and PHP version",
        detail:
          "A missing semicolon in functions.php, a function from a newer PHP version, or an incomplete update leaves exactly this signature.",
        timebox: "4 min",
        commands: ["find wp-content -name '*.php' -newermt '1 day ago' | head -20", "php -l wp-content/themes/x/functions.php"],
        lookFor: "Parse error, 'Call to undefined function', memory exhaustion in the same message.",
      },
      {
        title: "Fix, then prevent",
        detail:
          "Patch the fatal (update the plugin/theme or revert the edit), then remove debug display and delete the log. Add a staging + backup step so updates never run blind on production.",
        timebox: "10 min",
        lookFor: "Clean page load, admin login, no new entries in the log.",
      },
    ],
    escalateWhen: [
      "The fatal is in WordPress core files (integrity compromised — check checksums)",
      "The cause is unknown after a plugin/theme isolation loop",
      "Recovery Mode link is expired or e-mail is not received",
    ],
    related: ["/errors/white-screen-of-death", "/errors/critical-error", "/plugins/plugin-fatal-error"],
  },
  {
    id: "plugin-conflict",
    title: "Plugin conflict",
    blurb: "Everything works except one feature — the classic conflict isolation procedure.",
    icon: "plugin-conflict",
    severity: "P3 — Normal",
    trigger: "A specific feature breaks (an AJAX action, the editor, a checkout step) while the rest of the site is fine.",
    firstResponse: "State the isolation promise clearly: we will find the conflicting pair on staging, not disable plugins randomly on production.",
    steps: [
      {
        title: "Write the failing path as one sentence",
        detail: "E.g. 'Clicking Place order from the checkout returns 500, but only for logged-out users.' Precise scope cuts isolation time in half.",
        timebox: "2 min",
        lookFor: "Logged-in vs logged-out, cache on/off, one user vs all, mobile vs desktop.",
      },
      {
        title: "Capture the error before touching anything",
        detail: "Browser console + network response body + debug.log for the exact moment of failure.",
        timebox: "3 min",
        commands: ["tail -f wp-content/debug.log"],
        lookFor: "The plugin/theme file and function in the stack, or an HTTP 500 with an empty body.",
      },
      {
        title: "Halve the plugin set",
        detail:
          "On staging: deactivate half the plugins, test; then the other half. This finds the conflict in log2(n) steps instead of n full passes.",
        timebox: "6 min",
        commands: ["wp plugin deactivate $(wp plugin list --status=active --field=name | head -n 8)"],
        lookFor: "Which half contains the offending plugin, then repeat inside that half.",
      },
      {
        title: "Confirm the pair, not just the plugin",
        detail:
          "Some features only break when two plugins interact (cache + checkout, SEO + REST, security + AJAX). Re-enable both together to reproduce deterministically.",
        timebox: "5 min",
        lookFor: "Reproducible failure with both active, clean result with either deactivated.",
      },
      {
        title: "Modern problems, modern causes",
        detail:
          "Common conflicts: two plugins hooking the same action at the same priority, REST nonce/cookie handling, HPOS order storage, PHP 8 deprecations, snippet managers duplicating logic.",
        timebox: "5 min",
        commands: ["wp eval 'global $wp_filter; var_dump(array_keys($wp_filter[\"init\"]->callbacks[10]));'"],
        lookFor: "Same hook registered twice, plugin A's callback throwing and aborting plugin B's logic.",
      },
      {
        title: "Deliver a fix, not a disabled plugin",
        detail:
          "Options in order of preference: update both plugins → move a snippet to a child theme → report upstream with the stack trace → document the workaround in the KB.",
        timebox: "10 min",
        lookFor: "Feature works with both plugins active, or a documented temporary workaround with the ticket linked.",
      },
    ],
    escalateWhen: [
      "The conflicting plugin is closed-source or premium with no update path",
      "The fix requires modifying vendor code that will be overwritten on update",
    ],
    related: ["/plugins/plugin-conflict", "/plugins/plugin-fatal-error", "/elementor/safe-mode"],
  },
];
