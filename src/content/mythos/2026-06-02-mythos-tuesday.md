---
title: 'randombit/botan CVE-2026-34580: improper-cert-validation'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2128 total disclosed.'
pubDate: 2026-06-02T18:00:17.552Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-34580'
  - 'CVE-2026-4747'
  - 'CVE-2026-5194'
  - 'CVE-2026-5398'
  - 'CVE-2026-6386'
  - 'GHSA-v782-6fq4-q827'
projects:
  - 'freebsd/freebsd-src'
  - 'randombit/botan'
  - 'wolfssl/wolfssl'
headline_snapshot:
  disclosed: 2128
  acknowledged: 1725
  fixed: 414
  advisories: 448
---

Six identifiers landed on 2026-06-02, split across three projects, with freebsd/freebsd-src carrying three of them on its debut and randombit/botan making its own first appearance alongside it. Use-after-free and improper certificate validation dominate the bug classes across the batch. The activity brings running totals to 2128 disclosed, 1725 acknowledged, 414 patched, and 448 CVEs/GHSAs published.

**freebsd/freebsd-src** — first appearance

freebsd/freebsd-src opens its Mythos presence with three CVEs. CVE-2026-4747 is a stack-buffer-overflow; CVE-2026-5398 and CVE-2026-6386 are both use-after-free vulnerabilities in the same codebase.

**randombit/botan** — first appearance

Botan also makes its debut today with two identifiers sharing the same bug class. CVE-2026-34580 and GHSA-v782-6fq4-q827 both describe improper certificate validation flaws in randombit/botan.

**wolfssl/wolfssl**

CVE-2026-5194 rounds out the day's disclosures in wolfssl/wolfssl, listed under the catch-all "other" bug class.

Two new projects entering on the same day broadens the corpus beyond its previous scope, and the spread across memory-safety and certificate-validation classes shows Mythos surfacing distinct failure modes in each new target. At 2128 disclosed and 414 patched, the gap between discovery and remediation remains the defining characteristic of the dashboard, and six more findings on a single day push it wider still.

Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-06-02._
