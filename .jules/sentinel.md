## 2025-04-24 - Missing Global Security Headers

**Vulnerability:** The Cloudflare Pages deployment lacked global HTTP security headers (like X-Frame-Options, X-Content-Type-Options, etc.), leaving the site potentially vulnerable to clickjacking, MIME-type sniffing, and other basic web attacks.
**Learning:** In Cloudflare Pages, security headers aren't added automatically. They must be explicitly defined using a catch-all route (`/*`) in the `public/_headers` file.
**Prevention:** Always ensure a `/*` block exists in `public/_headers` with baseline security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) for all Cloudflare Pages deployments.
