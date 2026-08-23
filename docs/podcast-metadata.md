# Podcast show metadata — decisions and rationale

The channel block in [src/pages/podcast/rss.xml.ts](../src/pages/podcast/rss.xml.ts) stopped
being page metadata on **2026-08-23**, when the feed became the source of record for a public
Spotify show ([2r9MIeNT0aVkbcaLRUeMqM](https://open.spotify.com/show/2r9MIeNT0aVkbcaLRUeMqM)).
Those constants are now product surface: the name in search results, the tile art, the blurb a
stranger reads before subscribing, and the categories that decide where the show gets browsed.

This file records what was decided and why, so a future edit is deliberate. It is not a
conformance checklist — the feed's technical conformance was verified separately.

Source for the discovery rules below: Spotify for Creators' _Optimization Playbook_, §1 "Nail
the first impression" and §2 "Optimize your podcast SEO".

## The one-way door

Changing `<title>` renames the public show on Spotify's next poll. Decide once.

Independently, **existing `guid`s are immutable**. They are `isPermaLink` URLs built from the
episode slug, and upstream (`clodcast`) derives the slug _from the episode title_
(`skills/daily-podcast/render.py` → `slug = slugify(title, date_iso)`). So changing the title
**format** of already-published episodes would change their slugs, change their guids, and make
Spotify treat 75 existing episodes as brand-new — duplicating the back catalogue. Any titling
change applies to future episodes only, or decouples display title from slug first.

## Decisions

| Field                   | Value                                                      | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PODCAST_TITLE`         | `Cortech Daily`                                            | The previous `Cortech — Daily Digest Podcast` tripped three items on the playbook's SEO checklist at once: an em dash (special characters render inconsistently across directories), the word "Podcast" (the playbook calls generic terms like "pod"/"podcast" a waste of a searchable field), and "Daily Digest" as a **colliding name** — the playbook warns that when many results match a name, more popular items outrank you. `Cortech Daily` is short enough to survive mobile tile truncation and spelled to match `CortechOS`, the README, and the domain. An intercap (`CorTech`) was considered and rejected: it appears on no other surface we own, and the playbook advises against unusual spellings. |
| `PODCAST_DESCRIPTION`   | see source                                                 | Rewritten to lead with listener value rather than format — the playbook wants the first two lines to hook, with no links or ads. Names the host (a checklist item), states the concrete promise (≈9 minutes, ≈11 stories, sourced), and covers the full topic range so search has keywords to match. **The AI-narration disclosure is load-bearing and must stay**: Spotify actively prunes undisclosed AI-generated shows, so transparency is a defensive asset.                                                                                                                                                                                                                                                   |
| `AUTHOR` / `OWNER_NAME` | `Schmug`                                                   | Three surfaces previously disagreed — the feed said `Schmug`, the description said "Cory Schmug", and clodcast's `config.json` sets `host_name: "Cory"`. `Schmug` wins because [CLAUDE.md](../CLAUDE.md) already fixes it as the site-owner name and it matches the GitHub handle a listener would search. The description now says Schmug too. Aligning clodcast's `host_name` is a companion issue.                                                                                                                                                                                                                                                                                                               |
| `OWNER_EMAIL`           | `cory@cortech.online`                                      | Unchanged, and **must stay deliverable** — Spotify re-verifies show ownership through it. `cortech.online` is on Cloudflare Email Routing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `CATEGORIES`            | `Technology`; `News` → `Tech News`; `Education` → `How To` | One bare category was the weakest possible discovery position; Apple and Spotify allow three. `News > Tech News` is arguably the truest fit — this is a daily news digest by format — and reaches a browse surface `Technology` alone never touches. All three are **exact Apple Podcasts strings**; invented categories are silently dropped.                                                                                                                                                                                                                                                                                                                                                                      |
| `COPYRIGHT`             | `© 2026 Schmug`                                            | Was absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `COVER_URL`             | `podcast-cover.png`, now 3000×3000                         | Was exactly the 1400×1400 minimum; 3000×3000 is the recommendation and what marketing surfaces upscale from. Re-cut from vector by [scripts/generate-podcast-cover.mjs](../scripts/generate-podcast-cover.mjs) rather than upscaled — the old art also still read "Daily Digest", the previous show name. Because "Cortech Daily" does not itself convey the subject, the playbook requires the art to, hence the `AI · SECURITY · CLOUDFLARE` strip. Verified legible at 120px (the playbook's "squint test").                                                                                                                                                                                                     |

## Episode titles

Every episode is titled `Daily Digest - August 23, 2026` — date-only, so nothing tells a browsing
listener what any episode is about and every title is interchangeable in search. The playbook's
checklist wants titles to highlight topics.

**Decision: decouple slug from title upstream, then enrich titles.** Because existing slugs are
already derived from date-only titles, making the slug independently date-derived reproduces every
current slug byte-for-byte — so titles become free text that can be enriched across the whole
75-episode back catalogue with zero guid churn. The material already exists: each episode's lead
paragraph names the day's stories.

This requires a companion change in `schmug/clodcast` and is **not** implemented here. Until it
lands, titles stay date-only. **Existing slugs must be left untouched.**

## `itunes:episode`

The number was `totalEpisodes - idx` — derived from position in the feed, not from anything stable.
Appending a newer episode happened to be safe; inserting an **older** one was not. Back-filling a
missed date increments `totalEpisodes` and shifts the number of every newer episode, so episode 75
becomes 76 while keeping its guid.

This was not hypothetical: the feed holds **75 episodes across an 84-day span** (2026-06-01 to
2026-08-23), with 9 calendar gaps queued for back-fill — 06-03, 06-17, 06-22, 06-29, 07-01, 07-12,
07-17, 07-19, 08-08.

The number is now derived from the **publish date**, with day 1 = 2026-06-01, the first published
episode. Each number is the one that date has always owned, so a back-fill slots into its own gap
and touches nothing else; once the 9 gaps are filled the sequence is contiguous. A date at or
before the epoch yields no valid positive integer, so the tag is omitted rather than emitting `0`.

**One-time effect:** because the 9 gaps are not yet filled, existing episodes renumber once when
this ships — the newest goes from 75 to 84. This is cosmetic and safe: `guid`s are untouched, so
nothing duplicates, and `itunes:type` is `episodic`, where ordering is by date and episode numbers
are optional.

`_rss.xml.test.ts` pins the channel metadata and proves that inserting an older episode does not
renumber existing ones.
