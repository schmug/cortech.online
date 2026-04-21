## 2024-05-24 - [Missing Security Headers on Cloudflare Pages]
**Vulnerability:** Missing standard HTTP security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) leaving the site vulnerable to clickjacking, MIME-type sniffing, and downgrade attacks.
**Learning:** Cloudflare Pages (where this site is deployed) doesn't automatically add standard security headers. We need to manually specify them in a `public/_headers` file to ensure they are applied to static assets.
**Prevention:** Use a catch-all route `/*` in the `public/_headers` file to enforce these security headers globally for all responses served by Cloudflare Pages.
