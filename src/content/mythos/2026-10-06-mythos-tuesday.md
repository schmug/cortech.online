---
title: 'wireshark/wireshark CVE-2026-15165: heap-buffer-overflow'
description: 'Daily Mythos tracker. Newly revealed CVE. New project added. Funnel or bug-class shift. 6157 total disclosed.'
pubDate: 2026-10-06T01:25:52.098Z
triggers:
  - 'revealed'
  - 'new_project'
  - 'bug_class_shift'
  - 'funnel_shift'
cve_ids:
  - 'CVE-2026-64624'
  - 'GHSA-rq8f-9xjh-pr3m'
  - 'CVE-2026-73241'
  - 'GHSA-rqgv-grx4-xm6x'
  - 'CVE-2026-63652'
  - 'CVE-2026-64621'
  - 'GHSA-9g22-w2gr-vcmp'
  - 'GHSA-f27x-frr8-j9hc'
  - 'CVE-2026-63633'
  - 'CVE-2026-64620'
  - 'CVE-2026-68579'
  - 'GHSA-72j9-356v-88xq'
  - 'GHSA-m37j-jcr2-8gcc'
  - 'GHSA-pjqx-v446-x7fc'
  - 'CVE-2026-73242'
  - 'GHSA-vv64-95pc-vj9v'
  - 'CVE-2026-15165'
  - 'CVE-2026-15170'
  - 'CVE-2026-76888'
  - 'GHSA-3q2h-7599-7r76'
  - 'GHSA-hfrj-29vh-pcf2'
  - 'CVE-2026-15166'
  - 'GHSA-h9wc-3j4p-q5g3'
  - 'CVE-2026-19694'
  - 'CVE-2026-76890'
  - 'CVE-2026-76891'
  - 'CVE-2026-6039'
  - 'CVE-2026-6040'
  - 'CVE-2026-6045'
  - 'CVE-2026-6047'
  - 'CVE-2026-8356'
  - 'CVE-2026-8357'
  - 'CVE-2026-8358'
  - 'CVE-2026-63272'
  - 'CVE-2026-63273'
  - 'CVE-2026-63274'
  - 'CVE-2026-63275'
  - 'CVE-2026-63276'
  - 'CVE-2026-45751'
  - 'CVE-2026-45752'
  - 'CVE-2026-44235'
  - 'CVE-2026-44236'
  - 'CVE-2026-8462'
  - 'GHSA-pwmg-mvjw-4m23'
  - 'GHSA-85fq-fc5f-7j7g'
  - 'GHSA-44h9-v855-6rj3'
  - 'CVE-2026-63559'
  - 'CVE-2026-65423'
projects:
  - 'artifexsoftware/ghostpdl'
  - 'cesnet/libyang'
  - 'dhis2/dhis2-core'
  - 'freerdp/freerdp'
  - 'freetype/freetype'
  - 'gpg/gnupg'
  - 'jetty/jetty.project'
  - 'libmspub'
  - 'libreoffice/core'
  - 'minio/minio'
  - 'mm2/little-cms'
  - 'oisf/suricata'
  - 'open62541/open62541'
  - 'openmeterio/openmeter'
  - 'openssh/openssh-portable'
  - 'rabbitmq-c'
  - 'sctp/lksctp-tools'
  - 'u-boot/u-boot'
  - 'wireshark/wireshark'
headline_snapshot:
  disclosed: 6157
  acknowledged: 5103
  fixed: 516
  advisories: 584
---

Two remote-code-execution vulnerabilities in FreeRDP lead today's batch from Claude Mythos Preview. CVE-2026-64624 and GHSA-rq8f-9xjh-pr3m headline a set of FreeRDP advisories also covering auth-bypass (CVE-2026-73241, GHSA-rqgv-grx4-xm6x), double-free (CVE-2026-63652, CVE-2026-64621, GHSA-9g22-w2gr-vcmp, GHSA-f27x-frr8-j9hc), heap-buffer-overflow (CVE-2026-63633, CVE-2026-64620, CVE-2026-68579, GHSA-72j9-356v-88xq, GHSA-m37j-jcr2-8gcc, GHSA-pjqx-v446-x7fc), and out-of-bounds write (CVE-2026-73242, GHSA-vv64-95pc-vj9v).

Wireshark received a cluster of advisories today: heap-buffer-overflow in CVE-2026-15165, CVE-2026-15170, CVE-2026-76888, GHSA-3q2h-7599-7r76, and GHSA-hfrj-29vh-pcf2; stack-buffer-overflow in CVE-2026-15166 and GHSA-h9wc-3j4p-q5g3; buffer-overflow in CVE-2026-19694; and two advisories classified as other (CVE-2026-76890, CVE-2026-76891).

LibreOffice/core enters Mythos scope as a new project. First-intake CVEs include CVE-2026-6039, CVE-2026-6040, CVE-2026-6045, CVE-2026-6047, CVE-2026-8356, CVE-2026-8357, and CVE-2026-8358, alongside today's reveals: CVE-2026-63272 (heap-buffer-overflow), CVE-2026-63273 (oob-write), CVE-2026-63274, CVE-2026-63275, and CVE-2026-63276 (stack-buffer-overflow).

Suricata adds two use-after-free vulnerabilities, CVE-2026-45751 and CVE-2026-45752. RabbitMQ-C surfaces an integer-underflow (CVE-2026-44235) and a heap-buffer-overflow (CVE-2026-44236). SQL injection findings land in openmeterio/openmeter (CVE-2026-8462) and dhis2/dhis2-core (GHSA-pwmg-mvjw-4m23). Jetty adds a denial-of-service advisory (GHSA-85fq-fc5f-7j7g). cesnet/libyang receives a stack-buffer-overflow (GHSA-44h9-v855-6rj3). open62541/open62541 enters scope with first CVEs CVE-2026-63559 and CVE-2026-65423.

Additional projects newly in scope: artifexsoftware/ghostpdl, freetype/freetype, gpg/gnupg, jetty/jetty.project, libmspub, minio/minio, mm2/little-cms, openssh/openssh-portable, sctp/lksctp-tools, and u-boot/u-boot.

The dashboard as of 2026-10-02 stands at 6157 disclosed, 5103 acknowledged, 516 patched, and 584 CVEs/GHSAs published.

_Source: Anthropic's Mythos CVD dashboard at https://red.anthropic.com/2026/cvd/_
