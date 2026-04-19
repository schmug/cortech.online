## 2025-02-27 - [Sentinel] Added noreferrer to external links in Astro pages
**Vulnerability:** External links opened in a new tab via `target="_blank"` or just general external navigation used `rel="noopener"` but were missing the `noreferrer` attribute.
**Learning:** While `noopener` prevents window.opener manipulation (a critical XSS risk on older browsers), it still allows the Referer header to be passed to external sites, which could potentially leak sensitive information.
**Prevention:** As a best practice, any external link should use both `rel="noopener noreferrer"`, unless there is a specific need to pass the Referer header.
