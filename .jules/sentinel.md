## 2026-04-22 - [Cloudflare Pages Security Headers]
**Vulnerability:** Missing global security headers (X-Frame-Options, X-Content-Type-Options, etc.) on the Cloudflare Pages deployment.
**Learning:** For Cloudflare Pages, security headers aren't added automatically and must be defined explicitly using a catch-all route (`/*`) in the `public/_headers` file.
**Prevention:** Always include a `/*` block in `public/_headers` to apply basic security measures like HSTS, preventing clickjacking, and mitigating MIME-sniffing across the entire site.
