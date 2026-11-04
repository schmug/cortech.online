---
title: 'asterisk/asterisk CVE-2026-57191: oob-write'
description: 'Daily Mythos tracker. Newly revealed CVE. Funnel or bug-class shift. Findings withdrawn. 5087 total disclosed.'
pubDate: 2026-11-04T20:11:18.936Z
triggers:
  - 'revealed'
  - 'bug_class_shift'
  - 'funnel_shift'
  - 'withdrawal_surge'
cve_ids:
  - 'CVE-2026-57191'
  - 'CVE-2026-61627'
projects:
  - 'asterisk/asterisk'
  - 'libass/libass'
headline_snapshot:
  disclosed: 5087
  acknowledged: 3635
  fixed: 629
  advisories: 733
---

**2026-11-04 — Mythos Tracker**

Two memory-safety vulnerabilities went public today. **CVE-2026-57191** is an out-of-bounds write in `asterisk/asterisk`, the widely deployed open-source telephony stack. **CVE-2026-61627** is an out-of-bounds read in `libass/libass`, the subtitle rendering library used across media players and transcoding pipelines. Both were discovered by Claude Mythos Preview.

The two disclosures land against a backdrop of a sharp expansion in the oob-write category across the full corpus: the class grew by 657 findings in today's ledger update, the largest absolute increase recorded. The oob-read class added 184. Most other bug classes — including authenticity-not-verified (+265), exposed-secret (+253), filter-bypass (+221), memory-exhaustion (+234), and cpu-exhaustion (+217) — showed 100% changes, indicating broad population of previously empty categories rather than incremental discovery.

A withdrawal surge accompanied the expansion: 172 new withdrawals brought the total to 415 of 7349 findings. Out-of-scope is the leading withdrawal reason at 218 of 415; mistake accounts for 137 of 415, and duplicate for 44 of 415.

The average days-to-patch moved from 14.4 to 15.3. The median discovery-to-patch figure across 216 findings carrying both dates is 56 days; median discovery-to-reveal stands at 139 days over 237 findings.

The dashboard as of 2026-11-02T19:30:24.781518Z shows 5087 disclosed, 3635 acknowledged, 629 patched, and 733 CVEs/GHSAs published. The reveal-tier funnel across 7349 findings shows 3400 acknowledged by maintainer, 2260 discovered, 1452 sent, and 237 revealed. On severity calibration: across the 179 findings carrying both a Claude and a maintainer rating, the two disagree on 91 of 179 (50.8%); Claude rated higher on 79 of 179.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_
