---
title: 'cisco-talos/clamav CVE-2026-20213: integer-overflow'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2204 total disclosed.'
pubDate: 2026-07-21T18:01:02.780Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-20213'
  - 'CVE-2026-20214'
  - 'CVE-2026-20215'
  - 'CVE-2026-45696'
  - 'CVE-2026-6479'
  - 'GHSA-589g-qgf8-m6mx'
  - 'GHSA-6gff-7f37-2v35'
  - 'GHSA-86w7-h9x4-hpxv'
  - 'GHSA-hwfh-mh4f-m67f'
  - 'GHSA-rjvx-x4g3-vr6w'
projects:
  - 'asterisk/asterisk'
  - 'cisco-talos/clamav'
  - 'openexr'
  - 'postgres/postgres'
headline_snapshot:
  disclosed: 2204
  acknowledged: 1798
  fixed: 420
  advisories: 457
---

Ten identifiers landed on 2026-07-21, all under projects appearing in the Mythos corpus for the first time, with ClamAV carrying the majority of findings across integer-overflow and integer-underflow classes. The day's snapshot puts the running total at 2204 disclosed and 1798 acknowledged, with 420 patched across the full corpus. PostgreSQL, OpenEXR, and Asterisk each contribute at least one identifier alongside ClamAV's cluster.

**cisco-talos/clamav** (new project)

ClamAV is the largest single-project contributor of the day. Integer overflows are assigned CVE-2026-20213, CVE-2026-20215, GHSA-6gff-7f37-2v35, and GHSA-rjvx-x4g3-vr6w; integer underflows carry CVE-2026-20214 and GHSA-86w7-h9x4-hpxv. Each CVE is dual-filed with a GHSA alias, consistent with concurrent NVD and GitHub Advisory Database disclosure.

**postgres/postgres** (new project)

PostgreSQL enters the corpus with a denial-of-service pair: CVE-2026-6479 and GHSA-hwfh-mh4f-m67f.

**openexr** (new project)

CVE-2026-45696 is a heap-buffer-overflow, marking OpenEXR's first finding in the corpus.

**asterisk/asterisk** (new project)

GHSA-589g-qgf8-m6mx is a stack-buffer-overflow in Asterisk; the project debuts without a linked CVE ID.

The day amounts to a breadth expansion as much as a disclosure count: every project touched is new to Mythos, meaning the tool's coverage grew alongside the identifier tally. Integer arithmetic bugs — overflows and underflows together — account for the plurality of the ten findings, a pattern consistent with memory-unsafe C codebases processing untrusted input. The 457 CVEs/GHSAs published figure is unchanged from the prior snapshot, indicating public advisory publication had not yet followed any of these disclosures as of 2026-07-21.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-07-21._
