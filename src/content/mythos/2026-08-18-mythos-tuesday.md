---
title: 'rocketchat/rocket.chat CVE-2026-29198: sql-injection'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2300 total disclosed.'
pubDate: 2026-08-18T00:36:10.824Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-29198'
  - 'CVE-2026-31554'
  - 'CVE-2026-43074'
projects:
  - 'rocketchat/rocket.chat'
  - 'torvalds/linux'
headline_snapshot:
  disclosed: 2300
  acknowledged: 1815
  fixed: 421
  advisories: 462
---

Three identifiers landed on 2026-08-18, with torvalds/linux absorbing two of them as the project makes its first appearance in the Mythos tracked corpus; use-after-free dominates, accounting for both Linux kernel findings alongside a single SQL injection in Rocket.Chat. The dashboard stands at 2300 disclosed, 1815 acknowledged, 421 patched, and 462 CVEs/GHSAs published.

**torvalds/linux** — new project (Linux kernel)

Claude Mythos Preview added torvalds/linux to its project list on 2026-08-18. The two inaugural identifiers are both use-after-free findings: CVE-2026-31554 and CVE-2026-43074. No prior findings from this project exist in the corpus.

**rocketchat/rocket.chat**

CVE-2026-29198 is a SQL injection in the Rocket.Chat codebase.

The most significant development of the day is torvalds/linux entering the Mythos roster — the Linux kernel underpins an enormous share of deployed infrastructure, and its addition represents a meaningful expansion of project scope. Paired with CVE-2026-29198, the reveal event illustrates the two broad vulnerability classes that recur across Mythos disclosures: memory-safety failures in systems code and injection weaknesses in application-layer software. Against a corpus of 2300 disclosed findings, a single day adding a project of the Linux kernel's scale is worth noting.

_Source: Anthropic Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-08-18. The dashboard's daily series ends 2026-08-10, so the headline counts above are its current totals rather than same-day values._
