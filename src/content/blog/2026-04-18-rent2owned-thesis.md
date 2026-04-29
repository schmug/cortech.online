---
title: "Rent2Owned: The Thesis"
description: "The structured, citable companion to Rent2Owned. Claims, evidence, counterarguments, and sources. Forkable under CC-BY-4.0."
pubDate: 2026-04-18
tags: [rent2owned, open-source, sovereignty, surveillance-capitalism, thesis]
draft: false
---

## Metadata

| Field | Value |
|---|---|
| Version | 1.0.0 |
| License | CC-BY-4.0 |
| Canonical URL | https://cortech.online/blog/2026-04-18-rent2owned-thesis/ |
| Last updated | 2026-04-18 |
| Status | living document |
| Companion to | [Rent2Owned: The Case](/blog/2026-04-16-rent2owned-the-case/), [Rent2Owned: The Playbook](/blog/2026-04-17-rent2owned-the-playbook/) |

## Abstract

The dominant commercial software model is extractive: platforms monetize user behavior, shape user decisions through opaque algorithms, and lock customers into dependencies that convert paying users into unpaid maintainers of someone else's product. Open source code, self-hosted AI, and community-governed supply chains make this model unnecessary - the infrastructure already exists, the evidence that it works is already in print, and the only remaining question is whether individuals, organizations, and governments choose it. This document distills that argument into structured claims, evidence, and counterarguments, so it can be cited, forked, and extended.

## Core claims

### 1. The extraction model

**Claim:** The dominant revenue model of dominant consumer platforms is the commodification of human behavior, not the delivery of user value.

**Evidence:**

- Alphabet: 76-78% of total revenue from advertising; $64.6B from ads in a single quarter (SEC filings, 2024).
- Meta: 97.5% of 2024 revenue from advertising. Reuters (November 2025) reported internal projections of ~$16B/year from scam and banned-goods ad inventory.
- Amazon: $56.2B in ad revenue in 2024, up 20% year over year and the company's fastest-growing segment.
- Total digital ad industry: $259B in 2024, up 14.9% (Interactive Advertising Bureau).
- Proton (2025): approximately $700/year per US resident across major platforms; $217/year per US/Canada user at Meta; ~$460/year per American searcher at Google.
- Zuboff, S. *The Age of Surveillance Capitalism* (2019) - introduces "surveillance capitalism" and "Big Other" as terms for the distributed architecture of behavioral extraction.

**Counterarguments:**

- *"Ad-supported software provides free access to billions."*
  Rebuttal: The access is paid for in data and attention, which is measurable in dollars at the per-user level (above). The "free" framing is a marketing artifact.
- *"Users consent to data collection through Terms of Service."*
  Rebuttal: Consent to contracts that few users read, covering collection that cannot be opted out of without losing access to modern digital life, is not meaningful consent. Participation in daily life is now the supply chain of surveillance capitalism (Zuboff).

### 2. Algorithmic capture

**Claim:** Opaque algorithms controlled by a small number of private firms govern large portions of public life without the auditability that governance requires.

**Evidence:**

- Kate Crawford (Brookings, *Atlas of AI*): closed loops are not open to algorithmic auditing, review, or public debate.
- Pew Research Center (2017): the algorithms now governing significant portions of public life are overwhelmingly corporate.
- Cambridge Analytica (2018): paradigmatic case, but an extreme of a pattern rather than an exception.

**Counterarguments:**

- *"Algorithms improve user experience through personalization."*
  Rebuttal: Personalization is one effect. The primary optimization target in these systems is engagement and monetization. Users cannot inspect the tradeoff between their interests and the operator's.
- *"Users can opt out."*
  Rebuttal: Opt-out controls are partial, gameable, and do not apply to derived or inferred data. Control over visible settings is not control over the underlying model.

### 2a. Surveillance pricing

**Claim:** Personal data collected via surveillance is increasingly used to set individualized prices against the consumer, not only to serve ads.

**Evidence:**

- FTC 6(b) surveillance-pricing study (2024-2025): mouse movements, browser history, location data, and abandoned cart behavior are used as inputs to individualized pricing.
- FTC example: new parents, profiled as such, are shown higher-priced baby thermometers on page one of retail search results.
- Companies investigated: Mastercard, Accenture, PROS, Bloomreach, Revionics, McKinsey.
- 250+ retailer clients across grocery, apparel, health and beauty, home goods, and hardware.
- Senator Mark Warner (December 2025): consumers "at the mercy of amorphous data brokers capturing their data and using it to determine their maximum financial pain point."

**Counterarguments:**

- *"Differential pricing is efficient market behavior."*
  Rebuttal: Economic efficiency does not settle the question of informed consent. Consumers cannot see the pricing model, cannot negotiate, and have no mechanism to opt out other than abandoning the transaction entirely.

### 2b. Real-time bidding as mass data leakage

**Claim:** Real-time ad auctions broadcast user data to thousands of bidders, producing a privacy and security vulnerability that extends far beyond advertising.

**Evidence:**

- Electronic Privacy Information Center (EPIC): approximately 178 trillion real-time bidding auctions per year across the US and Europe.
- Each bid request includes ad identifiers, location, IP address, device details, interests, and demographics, and is broadcast to thousands of potential advertisers.
- Only one advertiser wins each impression; all participating bidders retain the request data.
- Bidstream data has been used to track union organizers, identify members of vulnerable populations, and enable warrantless surveillance.
- ICE, CBP, and FBI have purchased location data sourced from RTB brokers.

**Counterarguments:**

- *"RTB enables efficient advertising markets."*
  Rebuttal: The market-efficiency argument does not explain why bid-request data is retained and resold outside the auction itself. The leakage is a design choice, not an inherent feature of real-time auctions.

### 3. Vendor lock-in as governance failure

**Claim:** Vendor lock-in is not merely a technical or pricing problem. It is an abdication of governance over the software that runs critical operations.

**Evidence:**

- Springer, "Critical Analysis of Vendor Lock-In and Its Impact on Adoption of Cloud Computing" (2016).
- Cloud egress fees and interoperability gaps as persistent barriers to exit.
- 89% multi-cloud adoption alongside continued migration difficulty (BuzzClan, 2026).
- Cloudflare's public analyses of cloud switching costs.

**Counterarguments:**

- *"Vendors provide reliability and SLAs that in-house teams cannot match."*
  Rebuttal: Reliability is a property of the system, and community-maintained systems routinely meet or exceed enterprise reliability expectations (Linux, Postgres, Kubernetes, nginx, the BSD family). The vendor is one delivery mechanism for reliability, not the source of it.
- *"Switching costs are a market reality."*
  Rebuttal: When switching costs are high enough to prevent ever exiting, the arrangement is not a market transaction. It is a dependency, and dependencies require governance.

### 4. Contribution outperforms extraction

**Claim:** Active upstream contribution to open source produces measurably better returns than passive consumption or private forking.

**Evidence:**

- Linux Foundation, "Economic Value of Open Source Software Contributions" (2025):
  - 2-5x ROI for active contributors.
  - Top 100 contributors: $23.2B in measured value from $3.9B invested between 2018 and 2025 (6x return).
  - 49% of organizations contribute upstream; 45% maintain private forks.
  - Private forks incur hundreds of thousands of dollars per year per organization in hidden maintenance cost.
- Hilary Carter, SVP Research, Linux Foundation: "Contribution creates real, measurable value."
- Sentry's OSS Pledge: $2,000 per developer per year as an emerging industry norm for upstream funding.
- Eghbal, N. *Working in Public* (2020): economics of maintainer labor and the sustainability gap.

**Counterarguments:**

- *"Contributing upstream exposes proprietary competitive advantage."*
  Rebuttal: The commodity layer (databases, auth, queues, runtimes, operating systems) is not where competitive advantage lives. Identity-layer advantages remain private while commodity-layer contributions compound across the ecosystem.
- *"Most organizations lack the capacity to contribute meaningfully."*
  Rebuttal: Meaningful contribution begins with bug reports, documentation, and CI fixes. The 49% of organizations already contributing are not exclusively large firms with dedicated OSPOs.

### 5. Sovereignty through open source

**Claim:** Open source is the operative mechanism through which individuals, organizations, and governments reclaim control over their software, their data, and the inference performed on that data.

**Evidence:**

- Switzerland: EMBAG legislation (Federal Act on the Use of Electronic Means to Fulfill Government Tasks) makes publicly-funded government software open-by-default.
- Sweden: sustained data-protection enforcement through Integritetsskyddsmyndigheten (IMY), in addition to GDPR.
- European Union: digital sovereignty integrated into procurement rules, cybersecurity policy (Cyber Resilience Act), and emerging public AI infrastructure.
- CISA (US Cybersecurity and Infrastructure Security Agency): Open Source Software Security Roadmap; open-source security posture published as federal guidance.
- Open Source Initiative: framing of open source as a global digital commons.
- McKinsey, WEF, IBM, Stanford HAI: independent frameworks for "sovereign AI" converging on the same operational requirements - control over training data, model weights, and inference infrastructure.
- DeepSeek as the clean architectural example: the hosted endpoint sends prompts to servers operating under Chinese data law; the self-hosted deployment sends nothing anywhere. Same model, same weights, same math, different privacy posture because the architecture changed. Origin of the weights matters less than where the inference happens.

**Counterarguments:**

- *"Open source has its own governance problems - maintainer burnout, funding gaps."*
  Rebuttal: Valid concern. Funding patterns exist (Sentry's OSS Pledge, GitHub Sponsors, Linux Foundation fiscal hosting, EU-funded OSS audits). The money required is already being spent on vendor support contracts and SaaS subscriptions; redirecting a fraction of that spend closes most of the gap. The unsolved piece is the plumbing that moves money from those line items to maintainers.
- *"Open source is less secure than closed source."*
  Rebuttal: Linus's Law (many eyes make shallow bugs), Atlantic Council research on OSS funding and security outcomes, OpenSSF practices, and the raw fact of auditability. Closed source operates on security-through-obscurity, which is not a valid posture.

### 5a. The iceberg fact

**Claim:** Most commercial "proprietary" software is already predominantly open source. The vendor's contribution is packaging, integration, and support, not authorship.

**Evidence:**

- Black Duck / Synopsys 2025 Open Source Security and Risk Analysis (OSSRA), audit of 965 commercial codebases:
  - 97% of commercial codebases contain open source components.
  - 70% of the total code base, by volume, is open source in origin.
  - Average application contains 911 open source components.
  - In EdTech, semiconductors, and mobile applications: 100%.
- Vendor-managed maintenance quality (same report):
  - 91% of vendor-managed codebases contain components more than 10 versions out of date.
  - 79% contain components with no maintenance activity in the prior 24 months.

**Counterarguments:**

- *"Vendors add integration, support, and compliance value that individual consumers cannot replicate."*
  Rebuttal: True, and these are services around the code rather than substitutes for the code. Those services can be procured separately through consultancies, managed open source providers, or internal operations teams, without handing over control of the underlying system.
- *"Origin in open source does not mean customers can adopt open source directly."*
  Rebuttal: The SBOM test applies. If a customer can inspect the bill of materials, they can make an informed adoption decision. Vendors who decline to disclose the SBOM are the party restricting customer agency.

### 6. The workforce is viable

**Claim:** The "we cannot hire for this" objection reflects a broken hiring pipeline, not an absent workforce. Community-trained, portfolio-evaluated, AI-augmented developers exist and are being hired successfully by governments and small shops.

**Evidence:**

- GitHub: 100M+ developer accounts (December 2024 milestone).
- US Federal Tech Force (December 2025): 1,000 early-career technologists hired, accepting GitHub portfolios in place of four-year degrees.
- US Office of Personnel Management (OPM): federal hiring time reduced from over 100 days to under 80.
- Stack Overflow 2025 Developer Survey: 70% of developers using AI coding agents report reduced task time.
- Junior developer hiring collapsed 67% between 2023 and 2024 (multiple industry sources) - a private-sector pipeline failure, not an absence of talent.
- Upstream open source contribution teaches the exact skills most organizations need: code review, collaboration, security awareness, documentation, and the discipline of writing code others must read.

**Counterarguments:**

- *"Governments and indie shops cannot compete with tech-company salaries."*
  Rebuttal: Salary is one axis of compensation. Mission fit, ownership over the work, and the ability to ship without vendor-roadmap debt are others. The Federal Tech Force and successful indie hires demonstrate competitive viability on the non-salary axes.
- *"AI will replace developers rather than augment them."*
  Rebuttal: AI changes the skill mix and the productivity multiplier. Agent usage is reported as enhancement, not substitution (Stack Overflow 2025). Systems still require humans who can own them, read the code, and take responsibility for what the machine produces.

## Calls to action

### For individuals

- Audit what you own and what owns you.
- Reduce dependence on surveillance-funded platforms when reasonable alternatives exist.
- Support maintainers financially when you rely on their work.
- Treat your data as a leased asset, not a free donation.

### For organizations

- Conduct a stack audit by layer: commodity, identity, trust.
- Establish a written contribution policy, even a short one.
- Request SBOMs from every vendor. Treat refusal as a data point.
- Redirect a fraction of support-contract and SaaS spend to upstream maintainer funding.
- Hire one person who can contribute upstream and customize the identity layer with AI assistance, before hiring a full dev team.

### For governments

- Mandate open-by-default for publicly-funded software (Switzerland EMBAG precedent).
- Incorporate SBOM requirements and open source support into procurement.
- Hire via portfolio review rather than credential filters (Federal Tech Force precedent).
- Fund open source infrastructure audits (EU precedent).
- Build public AI infrastructure on open weights with domestic inference.

### For developers

- Contribute upstream to the libraries you actually depend on.
- Publish your portfolio in public; the hiring pipeline is turning toward it.
- Mentor at least one junior per year, whether inside your organization or through open source review.
- Build in the open whenever you can.

## Definitions

| Term | Definition |
|---|---|
| Surveillance capitalism | The commodification of human behavior as the primary revenue model of dominant consumer software, as defined by Shoshana Zuboff (2019). |
| Algorithmic capture | The dependence of public and private decision-making on opaque, corporate-controlled algorithmic systems that cannot be externally audited. |
| Surveillance pricing | Individualized pricing set through inputs derived from user behavior (mouse movements, browser history, location, abandoned carts) rather than market-level inputs. |
| Real-time bidding (RTB) | Millisecond-scale ad auctions in which user data is broadcast to thousands of potential bidders. Winning bidders buy the impression; all bidders retain the request data. |
| Digital sovereignty | Operational control over one's data, software, and inference such that jurisdictional, compliance, and governance constraints can be met without vendor permission. |
| Sovereign AI | Digital sovereignty applied to AI systems: operational control over training data, model weights, and inference infrastructure. |
| Supply chain governance | Policies and practices that determine what code enters a system, who approves it, how updates are handled, and whether the system can be independently reproduced and audited. |
| Commodity layer | The middleware and backend components of a system (databases, auth, queues, runtimes, frameworks, operating systems) most efficiently maintained in common. |
| Identity layer | The application-specific, mission-specific, brand-specific components of a system that distinguish one organization from another. |
| Trust layer | The governance layer that wraps both commodity and identity layers: SBOMs, contribution policies, update cadence, reproducibility. |
| SBOM | Software Bill of Materials. A machine-readable inventory of every component in a software product, with versions and licenses. Standards: SPDX, CycloneDX. |

## Bibliography

### Financial receipts (Claim 1)

- Alphabet Inc., SEC filings and 2024 earnings disclosures.
- Meta Platforms, Inc., SEC filings and 2024 earnings disclosures.
- Reuters (November 2025), coverage of internal Meta projections on scam ad revenue.
- Amazon.com, Inc., 2024 earnings disclosures.
- Interactive Advertising Bureau (IAB), 2024 Digital Advertising Revenue Report.
- Proton (2025), per-user data value analysis.

### Surveillance and data economics (Claims 2, 2a, 2b)

- Zuboff, Shoshana. *The Age of Surveillance Capitalism.* PublicAffairs, 2019.
- Federal Trade Commission, 6(b) surveillance-pricing study, 2024-2025.
- Electronic Privacy Information Center (EPIC), Real-Time Bidding reports.
- Senator Mark Warner, public statements on surveillance pricing (December 2025).

### Algorithmic accountability (Claim 2)

- Crawford, Kate. *Atlas of AI.* Yale University Press, 2021.
- Brookings Institution, algorithmic bias research.
- Pew Research Center, algorithmic transparency reports (2017).

### Open source economics and security (Claims 4, 5, 5a)

- The Linux Foundation, "Economic Value of Open Source Software Contributions" (2025).
- Black Duck / Synopsys, 2025 Open Source Security and Risk Analysis (OSSRA) report.
- Atlantic Council, open source security funding research.
- Open Source Security Foundation (OpenSSF).
- Cybersecurity and Infrastructure Security Agency (CISA), Open Source Software Security Roadmap.
- Eghbal, Nadia. *Working in Public.* Stripe Press, 2020.
- Sentry OSS Pledge.

### Sovereignty and policy (Claim 5)

- Open Source Initiative (OSI), digital commons framing.
- Switzerland, EMBAG legislation (Federal Act on the Use of Electronic Means to Fulfill Government Tasks).
- European Union, digital sovereignty and Cyber Resilience Act framework.
- Integritetsskyddsmyndigheten (IMY, Swedish Data Protection Authority), enforcement history.
- McKinsey, "Sovereign AI Ecosystems."
- IBM, "What is AI Sovereignty?"
- World Economic Forum, "Sovereign AI: Six Ways States Are Building It."
- Stanford HAI, "AI Sovereignty's Definitional Dilemma."

### Workforce (Claim 6)

- GitHub, Octoverse reports and 100M developer milestone announcement (December 2024).
- US Office of Personnel Management (OPM), Federal Tech Force announcement and hiring data (December 2025).
- Stack Overflow 2025 Developer Survey.
- DORA 2025 report.
- Industry coverage of 2023-2024 junior-developer hiring collapse.

### Vendor lock-in (Claim 3)

- Springer, "Critical Analysis of Vendor Lock-In and Its Impact on Adoption of Cloud Computing" (2016).
- BuzzClan (2026), multi-cloud adoption analysis.
- Cloudflare and Cloud Native Computing Foundation analyses of cloud switching costs.

## Version history

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-04-18 | Initial publication. |

## License

This document is released under the Creative Commons Attribution 4.0 International license (CC-BY-4.0).

Fork it. Extend its claims. Challenge its reasoning. Localize it to your jurisdiction. Use it as the scaffold for your own thesis, with attribution. That is the point.

## Companion posts

- [Rent2Owned: The Case for Taking Back Our Stack](/blog/2026-04-16-rent2owned-the-case/) - the narrative why.
- [Rent2Owned: The Playbook](/blog/2026-04-17-rent2owned-the-playbook/) - the operational how.

---

*Part three of three. Companion to [Rent2Owned: The Case](/blog/2026-04-16-rent2owned-the-case/) and [Rent2Owned: The Playbook](/blog/2026-04-17-rent2owned-the-playbook/).
Published as part of [cortech.online](https://cortech.online).*
