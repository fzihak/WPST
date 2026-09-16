export type Command = { cmd: string; desc: string; note?: string };
export type CommandGroup = { group: string; rows: Command[] };
export type CheatSheet = {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  groups: CommandGroup[];
};

export const CHEATSHEETS: CheatSheet[] = [
  {
    id: "wp-cli",
    title: "WP-CLI",
    icon: "wp-cli",
    blurb: "The fastest way to inspect a broken site without touching the browser.",
    groups: [
      {
        group: "Health & diagnostics",
        rows: [
          { cmd: "wp core version --extra", desc: "Core, PHP, MySQL and server versions in one shot" },
          { cmd: "wp plugin status", desc: "Deactivated vs deactivated-with-error plugins" },
          { cmd: "wp theme list --status=active", desc: "Which theme is live right now" },
          { cmd: "wp option get siteurl && wp option get home", desc: "URL mismatch = redirect loops" },
          { cmd: "wp site health status --format=table", desc: "Same data as the admin Site Health screen" },
          { cmd: "wp doctor check --all", desc: "Optional package: dozens of config checks" },
        ],
      },
      {
        group: "Plugins & themes",
        rows: [
          { cmd: "wp plugin deactivate --all", desc: "Nuclear isolation for WSOD / 500 errors" },
          { cmd: "wp plugin deactivate woocommerce && wp plugin activate woocommerce", desc: "Toggle a single suspect" },
          { cmd: "wp plugin update --all --dry-run", desc: "See what an update would change first" },
          { cmd: "wp plugin verify-checksums --all", desc: "Detect modified plugin files (malware check)" },
          { cmd: "wp theme verify-checksums twentytwentyfour", desc: "Spot tampered theme files" },
        ],
      },
      {
        group: "Database",
        rows: [
          { cmd: "wp db export backup.sql --add-drop-table", desc: "Always before a repair or migration" },
          { cmd: "wp db check", desc: "Reports corrupt tables" },
          { cmd: "wp db repair", desc: "Runs REPAIR TABLE on the WordPress tables" },
          { cmd: "wp db optimize", desc: "Reclaims space after mass deletes" },
          { cmd: "wp db query \"SHOW FULL PROCESSLIST\"", desc: "Find long-running or stuck queries" },
          { cmd: "wp search-replace 'old.com' 'new.com' --all-tables --precise --dry-run", desc: "Serialization-safe URL swap" },
        ],
      },
      {
        group: "Cache & cron",
        rows: [
          { cmd: "wp cache flush", desc: "Object cache, not page cache" },
          { cmd: "wp transient delete --all", desc: "Clears stuck transients and update locks" },
          { cmd: "wp cron event list --due-now", desc: "What should have run by now" },
          { cmd: "wp cron event run --due-now", desc: "Manually kick overdue events" },
          { cmd: "wp option get cron --format=json | head -c 400", desc: "Inspect the cron array" },
        ],
      },
      {
        group: "Users & content",
        rows: [
          { cmd: "wp user list --role=administrator", desc: "Audit admins during a compromise" },
          { cmd: "wp user update 1 --user_pass='NewPass!'", desc: "Recover a locked-out admin" },
          { cmd: "wp user application-password delete 5 --all", desc: "Revoke leaked API credentials" },
          { cmd: "wp post list --post_type=post --format=count", desc: "Content sanity check after migration" },
          { cmd: "wp option update blog_public 1", desc: "Undo 'discourage search engines' after launch" },
        ],
      },
    ],
  },
  {
    id: "mysql",
    title: "MySQL",
    icon: "cs-mysql",
    blurb: "Queries support engineers actually run on a failing WordPress database.",
    groups: [
      {
        group: "Inspect",
        rows: [
          { cmd: "SHOW TABLES LIKE 'wp_%';", desc: "Confirm the table prefix" },
          { cmd: "SHOW TABLE STATUS;", desc: "Engine, collation, rows, data length, overhead" },
          { cmd: "CHECK TABLE wp_posts, wp_options, wp_postmeta;", desc: "Corruption check before repair" },
          { cmd: "SHOW PROCESSLIST; KILL 12345;", desc: "Locate and kill a stuck query" },
          { cmd: "SHOW VARIABLES LIKE 'max_allowed_packet';", desc: "Why big imports fail" },
          { cmd: "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';", desc: "Cache sizing for performance" },
        ],
      },
      {
        group: "Repair & optimize",
        rows: [
          { cmd: "REPAIR TABLE wp_options;", desc: "MyISAM only — InnoDB tables ignore it" },
          { cmd: "OPTIMIZE TABLE wp_postmeta;", desc: "Defragment after bulk deletes" },
          { cmd: "ALTER TABLE wp_options ENGINE=InnoDB;", desc: "Migration leftover from MyISAM" },
          { cmd: "SET GLOBAL innodb_force_recovery=1;", desc: "Emergency only — take a file-level copy first" },
        ],
      },
      {
        group: "WordPress specifics",
        rows: [
          { cmd: "SELECT option_name, LENGTH(option_value) FROM wp_options ORDER BY 2 DESC LIMIT 20;", desc: "Find bloated autoloaded options" },
          { cmd: "SELECT COUNT(*) FROM wp_options WHERE autoload='yes';", desc: "Over ~300 means lost performance" },
          { cmd: "SELECT * FROM wp_options WHERE option_name='siteurl';", desc: "Redirect loop root cause" },
          { cmd: "DELETE FROM wp_options WHERE option_name LIKE '_transient_timeout_%' AND option_name NOT LIKE '%_wt_%';", desc: "Expired transients — export first" },
          { cmd: "SELECT SQL_CALC_FOUND_ROWS ID FROM wp_posts WHERE post_status='revision';", desc: "Count post revisions" },
        ],
      },
    ],
  },
  {
    id: "permissions",
    title: "Permissions",
    icon: "permissions",
    blurb: "Correct ownership and modes for WordPress on Linux hosting.",
    groups: [
      {
        group: "Modes",
        rows: [
          { cmd: "find . -type d -exec chmod 755 {} \\;", desc: "Directories" },
          { cmd: "find . -type f -exec chmod 644 {} \\;", desc: "Files" },
          { cmd: "chmod 600 wp-config.php", desc: "Secrets should not be world-readable" },
          { cmd: "chmod -R 775 wp-content/uploads", desc: "Only paths that must be writable by the web user" },
          { cmd: "chmod 644 .htaccess .user.ini", desc: "Rewrites written by plugins keep working" },
        ],
      },
      {
        group: "Inspect",
        rows: [
          { cmd: "ls -la | head -30", desc: "Spot 777 or odd owners instantly" },
          { cmd: "stat -c '%a %U:%G %n' wp-config.php", desc: "Mode, user and group of one file" },
          { cmd: "find . -perm -o+w -type f", desc: "World-writable files = compromise risk" },
          { cmd: "find wp-content -name '*.php' -mtime -7", desc: "Recently modified PHP in uploads = malware" },
          { cmd: "namei -l $(pwd)/wp-content/uploads", desc: "Permission of every path component" },
        ],
      },
      {
        group: "Ownership",
        rows: [
          { cmd: "chown -R user:usergroup public_html", desc: "Account owner on shared hosting (cPanel user)" },
          { cmd: "chown -R www-data:www-data /var/www/site", desc: "Dedicated server pattern" },
          { cmd: "sudo -u www-data wp plugin list", desc: "Prove the web user can write, not just your SSH user" },
        ],
      },
    ],
  },
  {
    id: "ftp",
    title: "FTP / SFTP / SSH",
    icon: "ftp",
    blurb: "File access and transfer when the dashboard is down.",
    groups: [
      {
        group: "Access",
        rows: [
          { cmd: "sftp user@host -P 2222", desc: "SFTP on a custom port" },
          { cmd: "ssh -v user@host", desc: "Verbose handshake — read where it fails" },
          { cmd: "lftp -u user,pass ftp://host", desc: "FTP when only FTP is available" },
          { cmd: "ftp -p host", desc: "Passive mode via CLI client" },
        ],
      },
      {
        group: "Triage transfer failures",
        rows: [
          { cmd: "nc -vz host 21 && nc -vz host 22", desc: "Is the port even open?" },
          { cmd: "curl --ftp-ssl -v ftp://host/ 2>&1 | tail -20", desc: "Read the actual FTP error code" },
          { cmd: "filezilla → Edit → Settings → Connection → plain FTP (for diagnosis)", desc: "Rule out TLS mode mismatch" },
          { cmd: "Passive mode on; switch to active only to prove a firewall theory", desc: "Most 'connection timed out' after login is passive-port blocking" },
        ],
      },
      {
        group: "Operate",
        rows: [
          { cmd: "put -r ./wp-content/themes/mytheme", desc: "Upload a theme folder recursively" },
          { cmd: "rsync -avz --delete public_html/ user@host:public_html/", desc: "Preferred over FTP for large trees" },
          { cmd: "mv plugins/woocommerce /home/user/disabled-plugins/", desc: "Disable a plugin without wp-admin" },
          { cmd: "get wp-config.php -", desc: "Print a file to stdout instead of saving secrets locally" },
        ],
      },
    ],
  },
  {
    id: "php",
    title: "PHP & php.ini",
    icon: "cs-php",
    blurb: "Limits, logging and OPcache directives that break WordPress sites.",
    groups: [
      {
        group: "Limits",
        rows: [
          { cmd: "memory_limit = 256M", desc: "Per-request PHP memory; 512M+ for builders/imports" },
          { cmd: "upload_max_filesize = 64M", desc: "Single file upload ceiling" },
          { cmd: "post_max_size = 64M", desc: "Must be ≥ upload_max_filesize" },
          { cmd: "max_execution_time = 300", desc: "Long migrations and cron batches" },
          { cmd: "max_input_vars = 5000", desc: "Large menus, options pages, WooCommerce settings" },
          { cmd: "max_input_time = 300", desc: "Time allowed to parse input (imports)" },
        ],
      },
      {
        group: "Logging",
        rows: [
          { cmd: "log_errors = On", desc: "Always on in production" },
          { cmd: "display_errors = Off", desc: "Never show raw errors to visitors" },
          { cmd: "error_log = /home/user/logs/php_error.log", desc: "Write outside the webroot" },
          { cmd: "error_reporting = E_ALL & ~E_DEPRECATED", desc: "Tune noise without hiding real issues" },
        ],
      },
      {
        group: "OPcache",
        rows: [
          { cmd: "opcache.enable = 1", desc: "Big win — but stale code after deploys" },
          { cmd: "opcache.validate_timestamps = 1", desc: "Set 0 only with an explicit reset step" },
          { cmd: "opcache.revalidate_freq = 0", desc: "Check timestamps on every request (dev/staging)" },
          { cmd: "opcache.memory_consumption = 256", desc: "MB; raise for large plugin sets" },
          { cmd: "php -i | grep -i opcache", desc: "Verify settings actually applied" },
        ],
      },
    ],
  },
  {
    id: "apache",
    title: "Apache / .htaccess",
    icon: "cs-apache",
    blurb: "Directives you need for WordPress diagnosis and hardening.",
    groups: [
      {
        group: "WordPress baseline",
        rows: [
          { cmd: "# BEGIN WordPress … # END WordPress", desc: "Never edit inside these markers" },
          { cmd: "RewriteEngine On / RewriteBase /", desc: "Required for pretty permalinks" },
          { cmd: "RewriteRule . /index.php [L]", desc: "Front-controller fallback" },
          { cmd: "AllowOverride All", desc: "Server-side requirement — 500s happen when it is None" },
        ],
      },
      {
        group: "Diagnosis",
        rows: [
          { cmd: "Rename .htaccess to .htaccess.bak", desc: "If the 500 disappears, the file is the cause" },
          { cmd: "Header set X-Debug 1 always", desc: "Prove mod_headers is loaded" },
          { cmd: "RewriteLog / RewriteLogLevel", desc: "Apache 2.2 only; use LogLevel rewrite:trace3 on 2.4" },
          { cmd: "tail -f /var/log/apache2/error.log", desc: "Read the real message, not the browser's" },
        ],
      },
      {
        group: "Hardening snippets",
        rows: [
          { cmd: "<Files wp-config.php>Require all denied</Files>", desc: "Block config file access" },
          { cmd: "Options -Indexes", desc: "Stop directory listings" },
          { cmd: "<Files xmlrpc.php>Require all denied</Files>", desc: "Disable XML-RPC at server level" },
          { cmd: "Header always set Strict-Transport-Security \"max-age=31536000\"", desc: "HSTS — only after HTTPS is fully verified" },
        ],
      },
    ],
  },
  {
    id: "nginx",
    title: "NGINX",
    icon: "cs-nginx",
    blurb: "WordPress rewrites, PHP-FPM timeouts and upstream errors.",
    groups: [
      {
        group: "WordPress block",
        rows: [
          { cmd: "location / { try_files $uri $uri/ /index.php?$args; }", desc: "Replaces .htaccess entirely" },
          { cmd: "location ~ \\.php$ { fastcgi_pass unix:/run/php/php8.2-fpm.sock; }", desc: "Point at the right FPM pool" },
          { cmd: "location ~* \\.(js|css|png|jpg|webp|svg)$ { expires 30d; }", desc: "Static asset caching" },
          { cmd: "location = /wp-config.php { deny all; }", desc: "Deny sensitive files" },
        ],
      },
      {
        group: "Troubleshooting",
        rows: [
          { cmd: "fastcgi_read_timeout 300;", desc: "The usual cure for 504 on long imports" },
          { cmd: "client_max_body_size 64m;", desc: "Stops 413 on uploads/restores" },
          { cmd: "proxy_read_timeout 300;", desc: "For proxied upstreams" },
          { cmd: "nginx -t && systemctl reload nginx", desc: "Always validate before reload" },
          { cmd: "tail -f /var/log/nginx/error.log", desc: "upstream timed out / permission denied appear here" },
        ],
      },
      {
        group: "Caching & Redis",
        rows: [
          { cmd: "fastcgi_cache_path /var/cache/nginx levels=1:2 keys_zone=WP:100m", desc: "FastCGI page cache zone" },
          { cmd: "set_real_ip_from CF-IPs; real_ip_header CF-Connecting-IP;", desc: "Real visitor IP behind Cloudflare" },
          { cmd: "redis-cli monitor | head", desc: "Watch WordPress key traffic" },
          { cmd: "redis-cli INFO memory", desc: "Hit ratio and memory pressure" },
        ],
      },
    ],
  },
  {
    id: "cloudflare",
    title: "Cloudflare & CDN",
    icon: "cloudflare",
    blurb: "Cache, SSL mode and 5xx that look like origin errors.",
    groups: [
      {
        group: "Cache",
        rows: [
          { cmd: "curl -sI https://site.com | grep -i cf-cache-status", desc: "HIT / MISS / BYPASS / DYNAMIC / REVALIDATED" },
          { cmd: "Purge cache (specific URL) after every deploy", desc: "Otherwise clients keep stale CSS/JS" },
          { cmd: "Bypass cache for /cart, /checkout, /my-account", desc: "Nonces and sessions must never be cached" },
          { cmd: "cf-connecting-ip in access logs", desc: "Otherwise every visitor shows as a Cloudflare IP" },
        ],
      },
      {
        group: "SSL & 5xx",
        rows: [
          { cmd: "SSL mode: Full (strict) with a valid origin certificate", desc: "Flexible mode causes redirect loops" },
          { cmd: "Error 520/521/522/524", desc: "Origin not answering or answering too slowly — check origin logs" },
          { cmd: "Error 1016 (record not found)", desc: "Origin keep-warm/validation is on but records are gone — disable it" },
          { cmd: "Temporarily grey-cloud a record to test the origin directly", desc: "Separates CDN issues from server issues" },
        ],
      },
      {
        group: "Rules",
        rows: [
          { cmd: "WAF: block xmlrpc.php from anonymous traffic", desc: "Reduces login brute force and load" },
          { cmd: "Rate limit /wp-login.php", desc: "Security → WAF → Rate limiting rules" },
          { cmd: "Cache Rule: bypass on cookie wordpress_logged_in_*", desc: "Prevents leaking logged-in pages" },
          { cmd: "Transform Rules: add security headers", desc: "CSP, HSTS, X-Frame-Options" },
        ],
      },
    ],
  },
  {
    id: "git",
    title: "Git",
    icon: "git",
    blurb: "Version control patterns for sites you also support live.",
    groups: [
      {
        group: "Daily",
        rows: [
          { cmd: "git switch -c fix/checkout-500", desc: "One ticket = one branch" },
          { cmd: "git diff --stat origin/main...HEAD", desc: "Review the blast radius before you ask for review" },
          { cmd: "git log --oneline --since='3 days ago'", desc: "What changed right before the incident" },
          { cmd: "git blame wp-content/themes/x/functions.php", desc: "Find who last touched the offending line" },
        ],
      },
      {
        group: "Recover & deploy",
        rows: [
          { cmd: "git stash -u && git pull --rebase", desc: "Get a clean tree on a shared server" },
          { cmd: "git revert <sha>", desc: "Preferred rollback for a bad hotfix" },
          { cmd: "git bisect start / good / bad", desc: "Binary-search the commit that broke it" },
          { cmd: "git archive --format=tar HEAD | ssh host 'tar -x -C public_html'", desc: "Deploy without a full clone" },
          { cmd: "commit → PR → preview → merge → deploy (Vercel/GitHub Actions)", desc: "Documented, reversible release process" },
        ],
      },
      {
        group: "Hygiene",
        rows: [
          { cmd: ".gitignore: wp-config.php, uploads/, cache/, *.log, node_modules/", desc: "Never commit secrets or user uploads" },
          { cmd: "git check-ignore -v wp-config.php", desc: "Verify the ignore rule applies" },
          { cmd: "git verify-pack -v .git/objects/pack/*.idx | wc -l", desc: "Sanity check repo size health" },
        ],
      },
    ],
  },
];
