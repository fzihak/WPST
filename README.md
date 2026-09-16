<p align="center">
  <img src="public/logo_wpst.png" alt="WordPress Support Toolkit Logo" width="120" />
</p>

<h1 align="center">WordPress Support Toolkit (WPST)</h1>

<p align="center">
  <strong>The Open-Source Troubleshooting Standard & Knowledge Base for WordPress Engineers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/react-19-61dafb.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-5.9-3178c6.svg?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-7-646cff.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/style-WordPress_Native-2271b1.svg?logo=wordpress" alt="WordPress Native Design" />
</p>

---

## 📌 Overview

**WordPress Support Toolkit (WPST)** is an open-source, investigation-first troubleshooting knowledge base built for support engineers, core developers, agencies, and hosting teams.

Unlike generic tutorials that tell you to *"just deactivate all plugins"*, WPST focuses on **scientific diagnosis and evidence collection**:
1. **Reproduce & Isolate** the root cause
2. **Collect logs and system evidence**
3. **Execute timeboxed fixes**
4. **Verify stability** before closing tickets

---

## ✨ Features

- **🚨 Error Resolution Library**: Deep-dive diagnostics for 500 Internal Server Error, White Screen of Death (WSOD), Memory Exhaustion, Redirect Loops, Permalinks 404, WooCommerce Payment Failures, REST API blocks, and more.
- **⏱️ Timeboxed Incident Runbooks**: Step-by-step P1/P2 runbooks for catastrophic outages (`site-down`, `checkout-failing`, `database-crash`).
- **🌲 Interactive Decision Trees**: Visual triage trees to narrow down unknown errors from symptoms to root cause.
- **📋 Operational Checklists**: Pre-launch, security hardening, migration, and maintenance checklists stored locally in the browser.
- **⚡ Command Cheat Sheets**: Fast copy-ready terminal references for WP-CLI, MySQL, Linux permissions, NGINX, Apache, PHP, and Cloudflare.
- **🛠️ Diagnostics Lab**: Generator for hardened `wp-config.php` debug blocks and standardized support ticket intake briefs.
- **🎨 WordPress-Native Aesthetic**: High-contrast, accessibility-friendly design matching native WordPress admin tokens with custom syntax-highlighted code blocks.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/wp-support-lab/wp-support-toolkit.git

# Navigate to project directory
cd wp-support-toolkit

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🏗️ Building for Production

Build the single-file, zero-dependency static production bundle:

```bash
npm run build
```

The optimized static artifact will be generated in `dist/index.html`. You can deploy this single file to any static host, CDN, S3 bucket, Cloudflare Pages, or GitHub Pages.

---

## 📁 Repository Structure

```text
├── content/               # MDX article files organized by section
│   ├── errors/            # 500, WSOD, memory, redirects, SSL
│   ├── wordpress/         # Core updates, recovery mode, cron, permalinks
│   ├── plugins/           # Conflict isolation, activation hooks, fatals
│   ├── themes/            # Template hierarchy, broken CSS
│   ├── woocommerce/       # Checkout, payment gateways, sessions
│   ├── elementor/         # Safe mode, styling, container issues
│   ├── mysql/             # Crashed tables, connection refused
│   ├── hosting/           # File permissions, timeouts, disk space
│   ├── php/               # Memory limits, execution timeouts, opcache
│   ├── apache/            # .htaccess rules, rewrite engines
│   ├── nginx/             # FastCGI timeouts, upstream headers
│   └── security/          # Malware isolation, backdoor removal
├── public/                # Static assets (logo_wpst.png, favicon)
├── src/
│   ├── components/        # UI components (Header, Footer, CodeBlock, Cards)
│   ├── data/              # Taxonomy, checklists, runbooks, decision trees
│   ├── lib/               # Router, markdown parser, search engine
│   └── pages/             # Home, Browse, Reference, Library, Meta
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

We welcome contributions from the global WordPress community!
Every article is a simple markdown (`.mdx`) file under `content/<section>/<slug>.mdx`.

1. Fork the repo and create a branch (`feature/new-article-slug`).
2. Add your troubleshooting guide using the standard 13-section template.
3. Verify formatting and links:
   ```bash
   npm run build
   ```
4. Submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
