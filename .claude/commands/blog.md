---
description: Turn a voice/text dump into a polished blog post PR for cortech.online
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
---

# /blog — mobile-first blog posting

Take whatever the user just dumped (typed or voice transcript) and ship it as a reviewable PR against `main`. Optimize for one Claude Code turn from a phone.

## Input

The user's message after `/blog` is the raw post body. If they invoked `/blog` with no body, ask **once** for the dump, then proceed without further questions — they're on a phone.

## Step 1 — Light-touch edit

Preserve the user's voice and phrasing. Do **not** rewrite for "flow."

- Fix grammar, spelling, punctuation
- Add `##` section headings where the dump has natural breaks (~2-4 sections for a typical post)
- Tighten transitions between sections — don't restructure them
- Keep their sentence shapes, slang, and asides intact
- Strip transcription artifacts: filler words ("um", "like", "you know"), false starts, repeated words

## Step 2 — Auto-enrich

Identify verifiable claims and add **1–2 supporting links per major claim**:

- Specific stats (e.g. "Cloudflare workers handle X requests/sec")
- Named products, companies, papers, events
- Quoted statements
- Technical claims that benefit from a doc/spec link

Use WebSearch to find authoritative sources, then WebFetch to confirm the link resolves and the claim is accurate. Add as inline markdown links where the claim appears. Anything that doesn't fit inline goes in a `## Further reading` section at the end.

If a claim can't be verified or the user is clearly speaking subjectively ("I think", "in my experience"), leave it alone.

## Step 3 — Infer metadata

Generate frontmatter matching the schema in [src/content.config.ts](src/content.config.ts):

- `title` — short, declarative, derived from the strongest idea. No clickbait.
- `description` — 1–2 sentences, under ~160 chars. Used by RSS and `/blog` index.
- `pubDate` — today's date in `YYYY-MM-DD` format. Get from `date +%Y-%m-%d`.
- `tags` — 3–5 lowercase, kebab-case if multi-word
- `draft: false`
- Skip `updatedDate`

## Step 4 — Slug + filename

- Slug: kebab-case from title, ascii only, max ~6 words
- Filename: `src/content/blog/<YYYY-MM-DD>-<slug>.md`
- Files starting with `_` are ignored by Astro — never use that prefix

## Step 5 — Write the post

Match the format of existing posts (see [src/content/blog/2026-04-16-hello-world.md](src/content/blog/2026-04-16-hello-world.md)):

```markdown
---
title: "Inferred title"
description: "Inferred 1–2 sentence summary."
pubDate: 2026-04-16
tags: [tag-one, tag-two, tag-three]
draft: false
---

## First section heading

Body of the post with [inline links](https://example.com) where they support claims.

## Second section

More body.

## Further reading

- [Source one](https://example.com/one) — what it is
- [Source two](https://example.com/two) — what it is
```

## Step 6 — Branch, commit, PR

Run these in order. Use the slug from Step 4.

```bash
git checkout -b claude/blog-<slug>
git add src/content/blog/<YYYY-MM-DD>-<slug>.md
git commit -m "$(cat <<'EOF'
feat(blog): <title>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push -u origin claude/blog-<slug>
gh pr create --title "feat(blog): <title>" --body "$(cat <<'EOF'
## Summary

<the post's `description` field>

**Tags:** `<tag-one>`, `<tag-two>`, `<tag-three>`

## Review checklist

- [ ] Cloudflare Pages preview renders the post correctly
- [ ] Title, description, and tags read well
- [ ] Inline research links resolve and support the claim they're attached to
- [ ] Tone matches voice

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Step 7 — Report

Output the PR URL on its own line so it's tappable on mobile. One sentence summary above it. Done.

## Out of scope

Defer these to follow-up commands or manual edits:

- Image uploads (no good mobile flow yet)
- `draft: true` posts
- `updatedDate` revisions to existing posts
- Re-running on PR feedback (just edit the PR or run `/blog` again with refined input)
