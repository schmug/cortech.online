---
title: "Rent2Owned: The Playbook"
description: "The why was part one. Here's the how - the architecture, the data, the workforce, the objections, and what to do Monday morning."
pubDate: 2026-04-17
tags: [rent2owned, open-source, sovereignty, sovereign-ai, indie]
draft: false
---

<!--
DRAFT - section-by-section. Voice: still indie-builder, but slightly
more operational than post 1. "The friend who also has a plan."
No antithesis, no three-beat tricolons, no throat-clearing, no corporate hedging.
Hyphens only, no en/em dashes.
-->

## I. The open

The why is in Part 1. This is the how.

If you're walking in with the usual objections - "closed source is safer because attackers can't see the code" or "open source has no funding model" - I hear you. Stay with me anyway. Both of those have aged badly in the last five years, and the countries already doing this have their own receipts to show you.

Here is the playbook, in one pass:

- Write our own code, as a community.
- Lease our data to the aaS companies on our terms, not theirs.
- Train AI models to do the work we need, our way, with data we own.
- Use our collective size and time to solve our actual problems.
- Build systems that fit our missions instead of the vendor's roadmap.
- Hire coders to build our own systems, instead of paying support contracts to maintain theirs.

None of this is fringe. Switzerland's EMBAG law already makes publicly-funded software open-by-default, Sweden has spent years building one of the strongest privacy regimes in the world, and the EU is pushing digital sovereignty into procurement, cybersecurity, and public AI infrastructure. If national governments can pivot here, so can your city - and so can you, as a builder.

## II. The architecture

Think about it like building a house. You don't mill the lumber or pour the cement. You pick the supplier, inspect what shows up, and sketch the rooms that actually serve the people living there. Software is the same. There are three layers, and each one wants different governance.

**Layer 1: the commodity layer.** This is the middleware and backend stuff you should never be writing from scratch: databases, auth, queues, caching, runtimes, web frameworks, operating systems. Open source foundations maintain these. You adopt them, you vet them, and if you're a serious operator you contribute back. A one-person shop running on Cloudflare Workers, D1, and R2 is standing on a decade of community work that would cost tens of millions to rebuild in-house. Don't try to own that alone - share the cost with the community that already is.

**Layer 2: the identity layer.** This is the part that is actually yours. Your UX, your workflows, your domain logic, your brand, the seams where your users and your mission meet the software. You do own this, and you should. This is where AI-native builders and small shops have a massive advantage over vendors right now, because you can ship a custom feature in a week that a SaaS product would take six quarters to prioritize. Your identity layer is the thing no vendor will ever build for you, because your users are not their customers.

**Layer 3: the trust layer.** This is the one people skip, and it's the one that bites. The trust layer is how you govern your supply chain - who vets what goes into your stack, how updates roll through, what you pin, what you track, and whether you can reproduce your build on a different machine next year. At minimum: an SBOM, a lockfile you actually read, and a simple written rule for how you take in updates. Dependabot plus signed commits plus a five-line CONTRIBUTING.md gets a small shop 80% of the way there. Skip the trust layer and you are one dependency hijack away from being the lead paragraph of somebody else's incident report.

The split is the whole argument - adopt the commons as your commodity layer, own what makes you different as your identity layer, and wrap both with the supply-chain discipline that keeps the whole thing safe. Miss any of the three and the argument falls apart.

## III. Data sovereignty and AI

Layer 1 and Layer 2 do most of the work, but they miss something on their own. The data moving through your stack is its own question. Who touches it, where it lives, what gets shipped off to vendors - those are architecture questions. You don't bolt privacy on at the end.

Privacy isn't a policy. It's an architecture decision.

For years, making that decision required choosing between "we have AI features" and "we keep our users' data to ourselves." That tradeoff is gone. Open source models - Llama, Mistral, DeepSeek R1 - run on a single modest GPU, a cheap home server, or even a laptop, and they do not phone home. You can run a classifier, a summarizer, a chatbot, or a full RAG pipeline without a single byte of user data leaving your infrastructure. Zero egress is a property of this architecture: the inference happens on hardware you control, and the bytes don't leave.

The DeepSeek controversy is the clean example of why this matters. Hosted DeepSeek sends your prompts to servers operating under Chinese data law. Self-hosted DeepSeek sends nothing anywhere. Same model, same weights, same math, two completely different privacy postures - because the architecture changed. Origin of the weights matters less than where the inference happens.

McKinsey, WEF, IBM, and Stanford HAI have all started calling this "sovereign AI." The short version: you keep operational control of your models and your training data, you avoid vendor dependencies on the inference path, and you can prove all of that to a regulator, an auditor, or a skeptical customer. That is the posture Sweden's privacy regime has been pushing toward for years, and the one the EU is writing into its AI rules.

For an indie builder the math is even simpler. Your users handed you their data because they trust you. Run the models yourself and you keep that trust.

## IV. The workforce

The objection I hear most when I float this playbook is the same one: "we can't hire developers."

The honest state of things first. Junior developer hiring collapsed 67% between 2023 and 2024. The private sector decided AI was a reason to stop training new engineers, and the effects of that decision are going to land hard somewhere between 2029 and 2033. We are watching an industry eat its own junior pipeline in real time.

Here is what that narrative misses. The community did not shrink. GitHub passed 100 million developer accounts in December 2024 and kept going. 97% of commercial codebases already contain open source. Developers who know how to contribute to it are the default demographic of software work. The talent didn't disappear; the hiring pipeline did. Those are different problems.

Government has already quietly figured out how to hire differently. The US Federal Tech Force put 1,000 early-career technologists on payroll in December 2025, accepting GitHub portfolios where a four-year degree used to be the checkbox. OPM cut the federal hire time from over 100 days to under 80. That is the hiring model this playbook depends on: look at what somebody has actually built and committed. Where they went to school is noise.

AI is the force multiplier that makes this work at indie scale. The 2025 Stack Overflow Developer Survey found that 70% of developers using AI coding agents report reduced task time. For a one-person shop, that ratio is the difference between contributing to open source and just consuming it - your part-time contributor, augmented, now ships what a team of four would have shipped in 2019.

And the training loop is already running. Upstream contribution teaches code review, collaboration, security awareness, and the discipline of writing code that someone else will actually have to read. Those are the same skills you would pay a senior developer to coach a junior on. The difference is that the senior is a maintainer in a foreign timezone, and you are paying forward with a few hours of your team's time and the occasional sponsored coffee.

A small shop doesn't need a dev team for its first hire. You need one person, AI-assisted, who can ship to your identity layer and contribute back to the commodity layer underneath it. That person is on GitHub right now. Their resume is a portfolio of pull requests, and you've been handed the wrong form to read.

## V. The objections

If you made it this far, you've probably already argued with some of this in your head. Here is the fast version of every pushback I have heard, with the shortest honest answer I have for each.

| Objection | Short answer |
|-----------|--------------|
| "Open source is less secure - attackers can read the code." | Closed source is security through obscurity, which has never held up. CISA's roadmap, Linus's Law, and the Atlantic Council's research on funded OSS all land in the same place: open code gets more scrutiny, and scrutiny is how bugs get found and patched. You can audit open source. You cannot audit your current vendor. |
| "But vendors warn us open source is risky." | Ask them for their SBOM - the Software Bill of Materials, the ingredient list of every open source component shipped inside their "proprietary" product. 97% of that code is the same stuff they're warning you about. If they can't or won't produce one, that silence is your answer. |
| "We can't maintain it." | You already are. You're just calling it "support contract" or "SaaS subscription" and not looking inside. Redirect the spend. |
| "It's messier." | Closed source is not cleaner, it's opaque. Visible problems get fixed; hidden problems ship to production and stay there. |
| "Who's liable?" | The same governance frame you already use for your vendor stack, applied to the stack you control: contribution policies, SBOMs, update cadence, and a written rule for who signs off on a dependency change. Same risk framework, more transparency. |
| "We don't have the people." | See the previous section. And: does your current vendor have people who understand your users better than you do? |

Here is the objection I do not have a clean answer for. Maintainer burnout is real, and the open source funding problem is not fully solved. Eghbal's Working in Public lays out the math - a handful of people maintain packages that billions of pieces of software depend on, usually without pay and without backup. We have good patterns now: Sentry's OSS Pledge, GitHub Sponsors, Linux Foundation fiscal hosting, EU-funded OSS audits. None of them, together, fully closes the gap.

The honest answer is that the money already exists. Organizations are paying more to vendors in support contracts and SaaS subscriptions than it would cost to properly fund the open source projects those vendors are quietly built on. Redirect even a fraction of that spend and the maintainers get paid. The plumbing - how that money actually flows from a support-contract line item to a maintainer you've never met - is what we are still figuring out.

## VI. The close

This is where the blog post ends and your week begins. The playbook does not run itself.

Monday morning: audit your stack. Two columns - what you own, and what owns you. Write it down.

This year: pick one commodity-layer dependency you want out of and spend an afternoon mapping what replacing it would cost. Change one thing about your trust layer - an SBOM you can actually produce, a five-line CONTRIBUTING.md, or a dependency-update policy that's a rule instead of a vibe. Contribute back at least once, whether that's a bug report, a docs PR, or the cost of a coffee for a maintainer who saved you a week.

Five years out, what I want is infra by the community and for the community. Thousands of small shops, local governments, and one-person app operators pooling their time, their money, and their patches into shared commodity code that none of them individually owns, while each of them keeps the identity layer and the mission that made them distinct. The plumbing underneath is maintained by everyone who uses it. That is sovereignty.

The why is in [Rent2Owned: The Case](/blog/rent2owned-the-case/). If you want the structured, citable version with every source, that's in [Rent2Owned: The Thesis](/blog/rent2owned-thesis/).

Your move.

---

*Part two of three. The why is in [Rent2Owned: The Case](/blog/rent2owned-the-case/);
the full thesis and sources are in [Rent2Owned: The Thesis](/blog/rent2owned-thesis/).
Published as part of [cortech.online](https://cortech.online).*
