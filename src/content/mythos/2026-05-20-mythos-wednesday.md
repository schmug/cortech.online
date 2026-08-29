---
title: 'nginx/nginx CVE-2026-27654: heap-buffer-overflow'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. 2094 total disclosed.'
pubDate: 2026-05-20T18:00:21.829Z
backfilled: true
triggers:
  - 'revealed'
  - 'new_project'
cve_ids:
  - 'CVE-2026-27654'
  - 'CVE-2026-32316'
  - 'CVE-2026-33721'
  - 'CVE-2026-33901'
  - 'CVE-2026-40033'
  - 'CVE-2026-41401'
  - 'CVE-2026-44420'
  - 'CVE-2026-44421'
  - 'CVE-2026-45700'
  - 'CVE-2026-46348'
  - 'CVE-2026-46349'
  - 'CVE-2026-5199'
  - 'CVE-2026-5446'
  - 'CVE-2026-5448'
  - 'CVE-2026-5501'
  - 'GHSA-5jqq-xpcr-q3r7'
  - 'GHSA-9f49-8x56-jmjc'
  - 'GHSA-cc7p-2j3x-x7xf'
  - 'GHSA-chgx-jx3p-rf73'
  - 'GHSA-crr4-7rm4-8gpw'
  - 'GHSA-f26g-jm89-4g65'
  - 'GHSA-hg75-4cmp-f367'
  - 'GHSA-j273-m5qq-6825'
  - 'GHSA-mpxh-8fq3-x8mh'
  - 'GHSA-mvpx-xj7r-3p3r'
  - 'GHSA-p6r2-4hgm-m6ff'
  - 'GHSA-q3h9-m34w-h76f'
  - 'GHSA-v7jp-vmx6-5429'
  - 'GHSA-vgv9-mv66-mpc7'
  - 'GHSA-x9h5-r9v2-vcww'
projects:
  - 'cesnet/libyang'
  - 'craftcms/cms'
  - 'freerdp/freerdp'
  - 'gitoxidelabs/gitoxide'
  - 'imagemagick/imagemagick'
  - 'jqlang/jq'
  - 'junrar'
  - 'mapserver'
  - 'mastodon/mastodon'
  - 'nginx/nginx'
  - 'temporalio/temporal'
  - 'wolfssl/wolfssl'
headline_snapshot:
  disclosed: 2094
  acknowledged: 1708
  fixed: 412
  advisories: 428
---

The 2026-05-20 reveal event brought an unusually wide set of first-time projects into the Mythos corpus, with freerdp/freerdp and wolfssl/wolfssl each drawing the largest clusters of findings and heap-buffer-overflow running through the majority of them. Use-after-free, signature bypass, server-side request forgery, cryptographic failure, and improper certificate validation round out the bug classes present, with every project in the batch making its debut. The running totals now stand at 2094 disclosed, 1708 acknowledged, 412 patched, and 428 CVEs/GHSAs published.

**freerdp/freerdp** leads with heap-buffer-overflow identifiers across CVE-2026-40033, CVE-2026-44420, CVE-2026-44421, CVE-2026-45700, GHSA-mpxh-8fq3-x8mh, GHSA-mvpx-xj7r-3p3r, and GHSA-p6r2-4hgm-m6ff. **wolfssl/wolfssl** contributes a mix: crypto failures in CVE-2026-5446 and GHSA-vgv9-mv66-mpc7, heap-buffer-overflows in CVE-2026-5448 and GHSA-5jqq-xpcr-q3r7, and improper certificate validation in CVE-2026-5501 and GHSA-hg75-4cmp-f367. **mastodon/mastodon** adds server-side request forgery (CVE-2026-46348, GHSA-crr4-7rm4-8gpw) and signature bypass (CVE-2026-46349, GHSA-chgx-jx3p-rf73). **cesnet/libyang** enters with use-after-free findings in CVE-2026-41401, GHSA-9f49-8x56-jmjc, and GHSA-v7jp-vmx6-5429. **imagemagick/imagemagick** contributes heap-buffer-overflows CVE-2026-33901 and GHSA-x9h5-r9v2-vcww. **jqlang/jq** brings CVE-2026-32316 and GHSA-q3h9-m34w-h76f, both heap-buffer-overflows. Single identifiers cover the remaining first-time projects: **nginx/nginx** (CVE-2026-27654, heap-buffer-overflow), **mapserver** (CVE-2026-33721, heap-buffer-overflow), **temporalio/temporal** (CVE-2026-5199, broken-access-control), **craftcms/cms** (GHSA-cc7p-2j3x-x7xf, privilege-escalation), **gitoxidelabs/gitoxide** (GHSA-f26g-jm89-4g65, RCE), and **junrar** (GHSA-j273-m5qq-6825, path-traversal).

The breadth of 2026-05-20 — remote-desktop clients, cryptographic libraries, media processors, web servers, a workflow engine, a CMS, a social platform, and an archive handler all entering the program simultaneously — illustrates how Mythos continues expanding into new corners of the open-source ecosystem. Heap-buffer-overflow's recurrence across so many distinct codebases reinforces that memory-safety weaknesses remain the most consistent class Mythos surfaces, regardless of project type or domain.

_Source: Anthropic's Mythos dashboard at https://red.anthropic.com/2026/cvd/_

_Backfilled: reconstructed from the `revealed_at` timestamps in Anthropic's CVD payload (as of 2026-08-26T18:55:53.809770Z), not published live on 2026-05-20._
