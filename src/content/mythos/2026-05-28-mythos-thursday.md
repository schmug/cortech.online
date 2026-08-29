---
title: 'joomla/joomla-cms CVE-2026-40383: path-traversal'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2102 total disclosed.'
pubDate: 2026-05-28T18:00:41.330Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-40383'
  - 'CVE-2026-40384'
  - 'CVE-2026-5295'
  - 'CVE-2026-6678'
  - 'GHSA-hr66-rv65-f5r4'
  - 'GHSA-v8h9-9g8j-w7h4'
projects:
  - 'joomla/joomla-cms'
  - 'wolfssl/wolfssl'
headline_snapshot:
  disclosed: 2102
  acknowledged: 1713
  fixed: 413
  advisories: 445
---

Path-traversal findings dominate the Mythos reveal log for 2026-05-28, split across a newly added project and a returning one, while buffer-overflow entries from wolfssl/wolfssl round out the day. Joomla CMS enters the Mythos corpus for the first time, carrying all of the path-traversal identifiers in today's reveal set. The dashboard stands at 2102 disclosed, 1713 acknowledged, 413 patched, and 445 CVEs/GHSAs published.

**joomla/joomla-cms (new project)**

Joomla CMS makes its debut in the Mythos ledger with path-traversal across all its opening identifiers:

- **CVE-2026-40383** — path-traversal in joomla/joomla-cms
- **CVE-2026-40384** — path-traversal in joomla/joomla-cms
- **GHSA-hr66-rv65-f5r4** — path-traversal in joomla/joomla-cms
- **GHSA-v8h9-9g8j-w7h4** — path-traversal in joomla/joomla-cms

**wolfssl/wolfssl**

wolfSSL contributes buffer-overflow CVEs to the day's total:

- **CVE-2026-5295** — buffer-overflow in wolfssl/wolfssl
- **CVE-2026-6678** — buffer-overflow in wolfssl/wolfssl

Today's reveal set splits cleanly between path-traversal in a CMS and buffer-overflow in a returning project — distinct bug classes, both well within what Claude Mythos Preview targets. Joomla's first-time entry is the day's headline event. The 2102 disclosed and 445 CVEs/GHSAs published on the dashboard put these additions in context as part of a sustained, broad-based research effort.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-05-28._
