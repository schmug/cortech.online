---
title: 'tryghost/ghost CVE-2026-26980: sql-injection'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2128 total disclosed.'
pubDate: 2026-06-03T00:00:21.791Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-26980'
  - 'GHSA-w52v-v783-gw97'
projects:
  - 'tryghost/ghost'
headline_snapshot:
  disclosed: 2128
  acknowledged: 1725
  fixed: 414
  advisories: 448
---

Two identifiers landed on 2026-06-03, both assigned to a single project and both classified as SQL injection: tryghost/ghost makes its first appearance in the Mythos corpus. The cumulative totals stand at 2128 disclosed, 1725 acknowledged, 414 patched, and 448 CVEs/GHSAs published.

**tryghost/ghost** — SQL injection

CVE-2026-26980 and its paired advisory GHSA-w52v-v783-gw97 are Ghost's inaugural entries in the dashboard. Both identifiers carry a SQL-injection classification in the tryghost/ghost project; the dual filing — one CVE alongside one GitHub Security Advisory — is consistent with cross-database coordination on a single underlying finding. The new-project flag confirms this is the first time Mythos has surfaced findings in this codebase, with CVE-2026-26980 recorded as its first entry.

The day amounts to a small count but a meaningful debut: a widely deployed open-source CMS enters the tracked corpus with SQL-injection findings, a class that continues to surface across Mythos targets. With 448 CVEs and GHSAs published and 2128 findings disclosed in total, the 2026-06-03 additions are incremental in volume but extend the dataset's reach into another major content platform.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-06-03._
