# Podcast show metadata — decisions and rationale

The site publishes two shows. Everything above the "Frontier Commits" heading is about
**Cortech Daily** ([src/pages/podcast/](../src/pages/podcast/)); the second show has its own
section at the bottom.

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

| Field                   | Value                                                      | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PODCAST_TITLE`         | `Cortech Daily`                                            | The previous `Cortech — Daily Digest Podcast` tripped three items on the playbook's SEO checklist at once: an em dash (special characters render inconsistently across directories), the word "Podcast" (the playbook calls generic terms like "pod"/"podcast" a waste of a searchable field), and "Daily Digest" as a **colliding name** — the playbook warns that when many results match a name, more popular items outrank you. `Cortech Daily` is short enough to survive mobile tile truncation and spelled to match `CortechOS`, the README, and the domain. An intercap (`CorTech`) was considered and rejected: it appears on no other surface we own, and the playbook advises against unusual spellings.                                                                                                         |
| `PODCAST_DESCRIPTION`   | see source                                                 | Rewritten to lead with listener value rather than format — the playbook wants the first two lines to hook, with no links or ads. Names the host (a checklist item), states the concrete promise (≈9 minutes, ≈11 stories, sourced), and covers the full topic range so search has keywords to match. **The AI-narration disclosure is load-bearing and must stay**: Spotify actively prunes undisclosed AI-generated shows, so transparency is a defensive asset.                                                                                                                                                                                                                                                                                                                                                           |
| `AUTHOR` / `OWNER_NAME` | `Schmug`                                                   | Three surfaces previously disagreed — the feed said `Schmug`, the description said "Cory Schmug", and clodcast's `config.json` sets `host_name: "Cory"`. `Schmug` wins because [CLAUDE.md](../CLAUDE.md) already fixes it as the site-owner name and it matches the GitHub handle a listener would search. The description now says Schmug too. Aligning clodcast's `host_name` is [schmug/clodcast#129](https://github.com/schmug/clodcast/issues/129).                                                                                                                                                                                                                                                                                                                                                                    |
| `OWNER_EMAIL`           | `clodcast@cortech.online`                                  | Moved off `cory@` so both shows route owner mail to one show address, separable from personal mail. **Must stay deliverable** — Spotify re-verifies ownership of this already-listed show through it, so a missing Cloudflare Email Routing rule costs the ability to prove ownership of a live show. Now shared with Frontier Commits, which means one broken rule takes down verification for both.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `CATEGORIES`            | `Technology`; `News` → `Tech News`; `Education` → `How To` | One bare category was the weakest possible discovery position; Apple and Spotify allow three. `News > Tech News` is arguably the truest fit — this is a daily news digest by format — and reaches a browse surface `Technology` alone never touches. All three are **exact Apple Podcasts strings**; invented categories are silently dropped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `COPYRIGHT`             | `© 2026 Schmug`                                            | Was absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `COVER_URL`             | `podcast-cover.png`, now 3000×3000                         | Was exactly the 1400×1400 minimum; 3000×3000 is the recommendation and what marketing surfaces upscale from. Re-cut from vector by [scripts/generate-podcast-cover.mjs](../scripts/generate-podcast-cover.mjs) rather than upscaled. Art as of 2026-08 is the horizon: a hard-edged amber rule running between CORTECH and DAILY under an ASCII sun (clodcast#163). The sun is the same 19×16 glyph table as `ASCII_SUN` in clodcast's `render.py`, which draws the episode covers — that shared table is what makes the show cover and every episode cover the same picture, so a change to one is a change to both. Because "Cortech Daily" does not itself convey the subject, the playbook requires the art to, hence the `AI · SECURITY · CLOUDFLARE` strip. Verified legible at 120px (the playbook's "squint test"). |

## Episode titles

Every episode is titled `Daily Digest - August 23, 2026` — date-only, so nothing tells a browsing
listener what any episode is about and every title is interchangeable in search. The playbook's
checklist wants titles to highlight topics.

**Decision: decouple slug from title upstream, then enrich titles.** Because existing slugs are
already derived from date-only titles, making the slug independently date-derived reproduces every
current slug byte-for-byte — so titles become free text that can be enriched across the whole
75-episode back catalogue with zero guid churn. The material already exists: each episode's lead
paragraph names the day's stories.

This requires a companion change in `schmug/clodcast` —
[#128](https://github.com/schmug/clodcast/issues/128) — and is **not** implemented here. Until it
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

---

# Frontier Commits

The second clodcast show — weekly, on what the frontier AI labs (Anthropic, OpenAI, Google
DeepMind, xAI) push to their public GitHub orgs. Page and feed:
[src/pages/frontier-commits/](../src/pages/frontier-commits/); manifest loader:
[src/lib/frontierEpisodes.ts](../src/lib/frontierEpisodes.ts). Added by
[#192](https://github.com/schmug/cortech.online/issues/192).

**This show is RSS-first.** Nothing publishes it to a directory on its behalf, so
`rss.xml` _is_ the show: the URL a listener subscribes to and the one submitted to Spotify
([#193](https://github.com/schmug/cortech.online/issues/193)). The same one-way door applies —
once a directory has polled the feed, `<title>` renames a public show.

## Decisions

| Field                 | Value                                                                | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PODCAST_TITLE`       | `Frontier Commits`                                                   | Two words, no special characters, no generic "podcast"/"pod" — the same SEO checklist Cortech Daily's title was rewritten against. Names the subject (the labs' commits) rather than the format.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `PODCAST_DESCRIPTION` | see source                                                           | Leads with listener value, names the four labs by name so search has keywords to match, and states the promise (weekly, sourced). **The AI-narration disclosure is load-bearing and must stay** — Spotify prunes undisclosed AI-generated shows.                                                                                                                                                                                                                                                                                                                                                                                        |
| `OWNER_EMAIL`         | `clodcast@cortech.online`                                            | Show mail, separable from personal mail — Cortech Daily now uses this address too, so it is no longer distinct per show. Spotify mails the submission verification code here, and Cory confirmed on 2026-08-24 that the address is live in Cloudflare Email Routing — the #193 prerequisite is met. Note the spelling: `clodcast`, matching the `schmug/clodcast` pipeline and the `clodcast.cortech.online` bucket host. It **must stay deliverable**, because Spotify re-verifies ownership through it — and now for **both** shows, so one broken routing rule takes down verification for the already-listed Cortech Daily as well. |
| `CATEGORIES`          | `Technology`; `News` → `Tech News`                                   | Exact Apple strings; invented ones are silently dropped. Two rather than the allowed three — the show is genuinely tech news, and no third category fits without inventing a stretch. `Education > How To` in particular does not apply.                                                                                                                                                                                                                                                                                                                                                                                                |
| `COVER_URL`           | [`frontier-commits-cover.jpg`](../public/frontier-commits-cover.jpg) | 1400×1400 JPEG, the square minimum both Apple and Spotify accept. Because "Frontier Commits" does not itself convey the subject, the art carries the tagline "the labs' open-source moves, weekly".                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `language`            | `en-us`                                                              | Matches Cortech Daily rather than a bare `en`; both are valid and consistency wins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## No `itunes:episode`

Cortech Daily derives its episode number from the publish date against a fixed epoch, because
deriving it from feed position renumbered the back catalogue whenever an older episode was
back-filled. Frontier Commits emits **no** `itunes:episode` at all: the tag is optional for an
`episodic` show, a weekly number needs an epoch, and the first episode has not shipped, so there
is no date to anchor one to. Add numbering when episode 1 has a publish date — never from
position in the feed.

## Until the first episode ships

`FRONTIER_MANIFEST_URL` defaults to the real R2 path, which **404s until clodcast publishes**, so
every build until then degrades to an empty episode list and a clean empty state. That is the
production path on merge day, not an edge case, and
[frontierEpisodes.test.ts](../src/lib/frontierEpisodes.test.ts) pins it. The env var exists to
point a build at a fixture (the Playwright suite does) or, set empty, to opt a build out of the
fetch entirely.
