---
title: 'wolfssl/wolfssl CVE-2026-5447: heap-buffer-overflow'
description: 'Daily Mythos tracker. Newly revealed CVE. 2300 total disclosed.'
pubDate: 2026-08-19T04:03:01.059Z
backfilled: true
triggers:
  - 'revealed'
cve_ids:
  - 'CVE-2026-5447'
  - 'CVE-2026-5466'
  - 'CVE-2026-5477'
  - 'CVE-2026-5479'
  - 'CVE-2026-5500'
  - 'CVE-2026-5503'
  - 'GHSA-47qf-hp3h-rwmm'
  - 'GHSA-65xm-pfx9-g5p3'
  - 'GHSA-grqc-3vmg-p68x'
  - 'GHSA-m77r-vqw2-hffx'
  - 'GHSA-mx4j-fjqx-f8qj'
projects:
  - 'wolfssl/wolfssl'
headline_snapshot:
  disclosed: 2300
  acknowledged: 1815
  fixed: 421
  advisories: 462
---

On 2026-08-19, every identifier the Mythos dashboard published traces to a single project: wolfssl/wolfssl. The day's reveals span four distinct bug classes — heap-buffer-overflow, signature-bypass, integer-overflow, and crypto-failure — and arrive against a running total of 2300 disclosed findings, 1815 acknowledged, 421 patched, and 462 CVEs and GHSAs published across the full Mythos corpus.

**wolfssl/wolfssl**

The following identifiers were revealed on 2026-08-19, all classified under the Other ecosystem:

- **CVE-2026-5447** — heap-buffer-overflow
- **CVE-2026-5466** — signature-bypass
- **CVE-2026-5477** — integer-overflow
- **CVE-2026-5479** — crypto-failure
- **CVE-2026-5500** — crypto-failure
- **CVE-2026-5503** — heap-buffer-overflow
- **GHSA-47qf-hp3h-rwmm** — signature-bypass
- **GHSA-65xm-pfx9-g5p3** — heap-buffer-overflow
- **GHSA-grqc-3vmg-p68x** — integer-overflow
- **GHSA-m77r-vqw2-hffx** — crypto-failure
- **GHSA-mx4j-fjqx-f8qj** — heap-buffer-overflow

Concentrating this many distinct bug classes in a single cryptographic library within one reveal event is significant: signature-bypass and crypto-failure findings go directly to the correctness guarantees that TLS implementations exist to provide, while heap-buffer-overflow and integer-overflow raise the prospect of memory corruption. Against the broader corpus, 421 of 2300 disclosed findings have been patched and 1815 are acknowledged — figures that together mark where the remediation effort currently stands.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-08-19. The dashboard's daily series ends 2026-08-10, so the headline counts above are its current totals rather than same-day values._
