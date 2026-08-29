---
title: 'wolfssl/wolfssl CVE-2026-12340: heap-buffer-overflow'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2300 total disclosed.'
pubDate: 2026-08-17T23:50:42.492Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-12340'
  - 'CVE-2026-13002'
  - 'CVE-2026-13595'
  - 'CVE-2026-35590'
  - 'CVE-2026-40528'
  - 'CVE-2026-40685'
  - 'CVE-2026-41579'
  - 'CVE-2026-41990'
  - 'CVE-2026-45447'
  - 'CVE-2026-46633'
  - 'CVE-2026-46639'
  - 'CVE-2026-47345'
  - 'CVE-2026-4890'
  - 'CVE-2026-4892'
  - 'CVE-2026-48929'
  - 'CVE-2026-55084'
  - 'CVE-2026-56132'
  - 'CVE-2026-5747'
  - 'CVE-2026-58435'
  - 'CVE-2026-6039'
  - 'CVE-2026-6040'
  - 'CVE-2026-6045'
  - 'CVE-2026-6047'
  - 'CVE-2026-63559'
  - 'CVE-2026-65423'
  - 'CVE-2026-66032'
  - 'CVE-2026-6772'
  - 'GHSA-425r-vwq2-26qv'
  - 'GHSA-59q6-j4w8-8pjx'
  - 'GHSA-776c-mpj7-jm3r'
  - 'GHSA-78pv-qq8x-94px'
  - 'GHSA-7p85-w9px-jpjp'
  - 'GHSA-c2q7-642g-3vwr'
  - 'GHSA-f684-cpcq-j565'
  - 'GHSA-jmwm-wc68-mhwm'
  - 'GHSA-m62j-63mf-xr95'
  - 'GHSA-mm6w-gr99-p3jj'
  - 'GHSA-p5j5-4j3q-8mq8'
  - 'GHSA-pjjp-65r7-ppgm'
  - 'GHSA-q349-x427-xg3w'
  - 'GHSA-qmc9-vqq2-8mv3'
  - 'GHSA-qpmf-9p9c-455w'
  - 'GHSA-rh79-75qm-gwjr'
  - 'GHSA-wc3v-3457-c8cm'
  - 'GHSA-wfx7-g85r-q6vw'
  - 'GHSA-wj3p-xhqm-pffc'
  - 'GHSA-xjvp-4fhw-gc47'
projects:
  - 'bytecodealliance/wasm-micro-runtime'
  - 'dhis2/dhis2-core'
  - 'dnsmasq'
  - 'exim/exim'
  - 'firecracker-microvm/firecracker'
  - 'go-gitea/gitea'
  - 'gpg/libgcrypt'
  - 'libass/libass'
  - 'libexpat/libexpat'
  - 'libgit2/libgit2'
  - 'libreoffice'
  - 'libssh2/libssh2'
  - 'libvips/libvips'
  - 'nss'
  - 'oisf/suricata'
  - 'open62541'
  - 'opencontainers/runc'
  - 'openmeterio/openmeter'
  - 'opensc'
  - 'openssl/openssl'
  - 'rocketchat/rocket.chat'
  - 'twigphp/twig'
  - 'typo3'
  - 'util-linux/util-linux'
  - 'wolfssl/wolfssl'
headline_snapshot:
  disclosed: 2300
  acknowledged: 1815
  fixed: 421
  advisories: 462
---

On 2026-08-17, Mythos revealed identifiers across a wide set of newly tracked projects, with heap-buffer-overflow, use-after-free, and stack-buffer-overflow accounting for the dominant bug classes. The dashboard now shows 2300 disclosed, 1815 acknowledged, 421 patched, and 462 CVEs/GHSAs published.

**openssl/openssl** enters the corpus with CVE-2026-45447 and GHSA-f684-cpcq-j565 (use-after-free). **wolfssl/wolfssl** adds CVE-2026-12340 and GHSA-q349-x427-xg3w (heap-buffer-overflow). **dnsmasq** contributes four identifiers: CVE-2026-4892 and GHSA-m62j-63mf-xr95 (heap-buffer-overflow), CVE-2026-13002 and CVE-2026-4890 (denial-of-service). **libreoffice** yields CVE-2026-6039, CVE-2026-6045, CVE-2026-6047 (heap-buffer-overflow), and CVE-2026-6040 (use-after-free). **nss** draws CVE-2026-6772 and GHSA-c2q7-642g-3vwr (heap-buffer-overflow). **gpg/libgcrypt** adds CVE-2026-41990 and GHSA-78pv-qq8x-94px (stack-buffer-overflow). **libexpat/libexpat** contributes CVE-2026-56132 and GHSA-425r-vwq2-26qv (heap-buffer-overflow). **opencontainers/runc** produces CVE-2026-41579 and GHSA-xjvp-4fhw-gc47 (symlink-following). **firecracker-microvm/firecracker** adds CVE-2026-5747 and GHSA-776c-mpj7-jm3r (oob-read). **open62541** yields CVE-2026-63559 and CVE-2026-65423 (integer-overflow). **twigphp/twig** contributes CVE-2026-46633 and GHSA-7p85-w9px-jpjp (code-injection) alongside CVE-2026-46639 and GHSA-mm6w-gr99-p3jj (auth-bypass). **oisf/suricata** adds GHSA-59q6-j4w8-8pjx and GHSA-qmc9-vqq2-8mv3 (use-after-free). **libvips/libvips** draws CVE-2026-35590 and GHSA-jmwm-wc68-mhwm (oob-write). **go-gitea/gitea** produces CVE-2026-58435 and GHSA-rh79-75qm-gwjr (IDOR). **util-linux/util-linux** adds CVE-2026-13595 and GHSA-qpmf-9p9c-455w (use-after-free). **exim/exim** contributes CVE-2026-40685 (off-by-one). **opensc** draws CVE-2026-40528 (stack-buffer-overflow). **typo3** yields CVE-2026-47345 and GHSA-p5j5-4j3q-8mq8 (XSS). **rocketchat/rocket.chat** adds CVE-2026-48929 (auth-bypass). **dhis2/dhis2-core** contributes CVE-2026-55084 (SQL injection). **libssh2/libssh2** adds CVE-2026-66032 (double-free). **libass/libass** draws GHSA-pjjp-65r7-ppgm (heap-buffer-overflow). **libgit2/libgit2** produces GHSA-wfx7-g85r-q6vw (heap-buffer-overflow). **bytecodealliance/wasm-micro-runtime** contributes GHSA-wj3p-xhqm-pffc (heap-buffer-overflow). **openmeterio/openmeter** adds GHSA-wc3v-3457-c8cm (SQL injection).

The reveals mark a broad expansion of Mythos's project coverage — from cryptographic libraries and container runtimes to web frameworks and health-data platforms — reflecting continued attention to foundational infrastructure software. At 421 patched against 2300 disclosed, the gap between discovery and remediation remains the clearest pressure point the corpus exposes.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-08-17. The dashboard's daily series ends 2026-08-10, so the headline counts above are its current totals rather than same-day values._
