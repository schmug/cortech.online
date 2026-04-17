---
title: "Rent2Owned: The Case for Taking Back Our Stack"
description: "We've been renting the software that runs our lives, and the landlord has broken every rule. Part one of three on owning your stack."
pubDate: 2026-04-16
tags: [rent2owned, open-source, sovereignty, surveillance-capitalism, indie]
draft: false
---

<!--
DRAFT - section-by-section. Each heading below is a section to fill in.
Voice: indie builder (cortech.online register). No antithesis, no
three-beat tricolons, no throat-clearing, no corporate hedging.
-->

## I. The open

There's a moment I bet you've had.

You open a tool you've been paying for and a feature you used yesterday is gone. Or the free tier quietly got worse. Maybe the pricing flipped overnight, or a setting that was on is now off and the new default serves the company instead of you.

That little whiff of "wait - I didn't agree to that."

Most of us shrug and move on. I have, for years. There's work to do, and the next small app won't ship itself.

Stack those moments end to end and they stop looking like annoyances. They're a pattern. Software we rely on changes under us, without our consent, to serve somebody else's balance sheet. Our data gets hoovered up and sold back to us as "personalization," and whatever feed or search result we're looking at is tuned by people we'll never meet, for outcomes we don't get a vote on.

We're paying in dollars and in data, and neither buys us a stake.

I'm not trying to sound grandiose. It just feels like the corporations are controlling the individual right now, and not the other way around.

We've been renting.

And the landlord has broken every rule.

## II. Follow the money

Let me skip the hand-wave and show you the receipts.

In 2024, Meta made 97.5% of its revenue from ads. Practically all of it. Google/Alphabet ran 76-78%, booking $64.6 billion from ads in Q2 alone. Amazon's ad business grew 20% year over year to $56.2 billion, its fastest-growing segment. All told, the digital ad industry cleared $259 billion in 2024, up 14.9% on the prior year.

These companies are ad companies with software departments.

Now flip it around. Proton put a number on what one US resident is worth to the major platforms: about $700 a year. Meta alone clocks $217 per US/Canada user. Google clocks around $460 per American searcher. The wholesale price for a row of your basic demographic data is $0.0005 - fifty cents per thousand people. That's the ratio. An industry built around buying and selling you is worth $278 billion, and your zip code fetches a twentieth of a penny on the wholesale side.

The mechanism is real-time bidding. Every time an ad loads, your browser broadcasts a packet of who you are - location, device, interests, inferred demographics - to thousands of potential advertisers, who bid in milliseconds. EPIC puts it at 178 trillion of these auctions a year across the US and Europe. Only one advertiser wins the impression; all of them keep the data. That bidstream is where data brokers get the feed they resell to anyone with a purchase order. ICE, CBP, and FBI have all bought location data sourced from it.

And then the data gets pointed back at you. The FTC's 2024-2025 surveillance-pricing investigation found major retailers using mouse movements, browser history, location, and abandoned carts to set individualized prices. The FTC's own example: a new parent, profiled as such, gets shown higher-priced baby thermometers on page one. You pay for "free" software with your behavior, that behavior gets auctioned in an instant, and the aggregate comes back at you as the price you'll be charged for the next thing you need. You are paying twice - once in data, once in dollars.

The one-liner version: you are not the customer, you are the product, and the receipts are public.

## III. The invisible steering wheel

The data part of this is what most people have heard. The part that doesn't travel as well is that the same systems shaping what you see are quietly picking the decisions you make.

The feed you scroll decides what today's world looks like, and the search results below it decide which facts you'll treat as facts. The product you end up buying, the story you end up reading, the job you apply for, the candidate you vote on - each of those passed through a recommendation layer before it got to you, and that layer is tuned for one thing: your continued engagement. Whether that happens to line up with your actual interests is incidental.

AI researcher Kate Crawford's way of putting it: closed loops are not open to algorithmic auditing, review, or public debate. You can't see the steering, and neither can a regulator, a researcher, or a journalist. Pew Research has pointed at the obvious downstream of that - the algorithms now governing big chunks of our lives are corporate. Built, tuned, and hidden by companies whose incentives are not lined up with yours.

Cambridge Analytica is the example everyone remembers, but it was never really the point. You don't need a scandal for the steering to be happening - it's the default mode.

This is where I stop framing the problem as a privacy problem. Privacy frames it as "they got my info" - a personal harm, a compliance checklist, a cookie banner. What's actually happening is a governance problem sitting under a privacy label. And if you want to go further and call it a democracy problem, I'm with you.

## IV. The pivot

So what do we do about it? The answer is closer than you think.

Open up a random "proprietary" codebase and measure it. Black Duck's 2025 OSSRA audit of 965 commercial codebases found that 97% contain open source components, and 70% of the actual code is open source in origin. The average application has 911 open source components in its dependency tree. In a few industries - EdTech, semiconductors, mobile apps - it's 100%.

You're already using open source. You're just paying a middleman to hide it from you.

When a vendor tells you their "proprietary" stack is safer, ask them for the SBOM. Most of the code they're selling you is the same code they're warning you about. And they aren't doing a great job with it: 91% of vendor-managed codebases have components more than ten versions out of date, and 79% have components with no maintenance activity in twenty-four months. The maintenance premium you're paying for? A lot of it isn't getting done.

Here's what open source actually gives you that proprietary cannot: the ability to audit what you're running, the ability to walk away when the project stops serving you, and a community whose incentives are more lined up with yours than any single vendor's roadmap ever will be.

The "it's messier" objection has it backwards. The mess is the same; the difference is whether you can see it. When a bug is visible in the code, somebody eventually fixes it. Hide the same bug inside a proprietary binary and it ships to production and stays there. Open source doesn't create messiness - it just refuses to hide it.

Governments are already out ahead. Switzerland's EMBAG law made publicly-funded software open-by-default. CISA has leaned into open source as a core part of the US federal cybersecurity posture. The Open Source Initiative has spent years framing this as a global digital commons - infrastructure the way roads are infrastructure, built and maintained in the open because that's what holds it up.

## V. The economics

Every time this comes up, the sticking point is the same: "open source sounds great, but we can't afford to maintain it."

You're already maintaining software - the support contract is just a way to pretend you aren't.

The Linux Foundation's 2025 study on the economic value of open source contributions put hard numbers on the other side of that equation. Active upstream contribution delivers 2-5x ROI. The top 100 contributors generated $23.2 billion in value from $3.9 billion invested between 2018 and 2025 - a 6x return. Forty-nine percent of organizations contribute upstream; forty-five percent maintain private forks that cost hundreds of thousands per year in hidden maintenance the org absorbs silently.

Hilary Carter, who runs research at the Linux Foundation, said the quiet part out loud: "Contribution creates real, measurable value." That's the CFO version. You redirect budget you're already spending - from support contracts that hide the code, to contribution that actually improves the code everybody in your industry is quietly using anyway.

If you want a norm to anchor it, Sentry's OSS Pledge calls for $2,000 per developer per year into upstream maintenance. That's a subscription a small shop can actually track, and rounding error at government scale.

## VI. The close

I'm not going to tell you to rip out your stack. That's not how this works, and it's not how anything that lasts gets built.

What I am going to tell you is that the current arrangement - the one where you pay a landlord to host your own life, your own business, your own data, and your own attention - is a choice. It got made for us by default, and it can be unmade.

I keep coming back to a simpler version of this. It's really about the community - humans controlling their own destiny, not a handful of ad companies doing it quietly on our behalf. Strength in numbers, in openness, in community, instead of the faults we hide inside closed source.

The ask is small. Audit what you already own and what owns you. Pick one tool or service in your stack where the lock-in is starting to cost you something you can see, and go look at the open alternative. Ask your next vendor for an SBOM. If you're a builder, find the library that saved you the most time this year and send its maintainer the cost of a coffee or a commit.

The how - the architecture, the workforce, the objections - is in [the playbook](/blog/rent2owned-the-playbook/). If you want the structured, citable version with all the sources, that's [the thesis](/blog/rent2owned-thesis/).

We've been renting. The door is not locked.

---

*Part one of three. The how is in [Rent2Owned: The Playbook](/blog/rent2owned-the-playbook/);
the full thesis and sources are in [Rent2Owned: The Thesis](/blog/rent2owned-thesis/).
Published as part of [cortech.online](https://cortech.online).*
