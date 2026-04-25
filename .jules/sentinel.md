## 2024-05-24 - Missing Global Security Headers in Cloudflare Pages
**Vulnerability:** The application was missing basic global security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). This could leave the application open to clickjacking, MIME type sniffing, and potential sensitive data leakage via the Referrer header.
**Learning:** For Cloudflare Pages deployments in this repository, HTTP security headers must be explicitly and globally defined using a catch-all route (`/*`) in the `public/_headers` file.
**Prevention:** Ensure any new deployments or significant configuration changes do not overwrite the `public/_headers` file and always maintain the catch-all security definitions.
