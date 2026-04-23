## 2024-03-24 - Missing Security Headers in Cloudflare Pages
**Vulnerability:** The application was missing basic security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security).
**Learning:** In Cloudflare Pages, these headers aren't added automatically and must be explicitly defined in a `public/_headers` file under a catch-all `/*` route.
**Prevention:** Always ensure a global `/*` block exists in `public/_headers` applying these baseline defenses.
