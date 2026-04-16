---
title: "Post title goes here"
description: "One-sentence summary used in the RSS feed and on the /blog index. Keep it under ~160 chars."
pubDate: 2026-04-16
# updatedDate: 2026-04-20    # uncomment if you revise after publishing
tags: [example, replace-me]
draft: true                   # flip to false (or delete the line) to publish
---

<!--
COPY THIS FILE to src/content/blog/<slug>.md and edit.

  cp src/content/blog/_template.md src/content/blog/2026-04-16-my-slug.md

The filename (minus the date prefix, if you use one) becomes the URL slug
unless you add a `slug:` field to the frontmatter. Files and folders that
start with "_" are ignored by Astro content collections, so this template
will never be published.

Frontmatter rules (enforced by src/content/config.ts once wired up):
  title         string, required
  description   string, required — shown in RSS <description> and /blog list
  pubDate       date, required — drives RSS sort order
  updatedDate   date, optional
  tags          array of strings, defaults to []
  draft         boolean, defaults to false — drafts are filtered out of
                /blog, /rss.xml, and the Blog desktop app

Images: drop them in public/blog/<slug>/ and reference as /blog/<slug>/foo.png
Code blocks: use triple backticks with a language hint for syntax highlighting.
-->

## Lead with the hook

Open with the question or surprise that pulled you into writing this post.
Two or three sentences. No throat-clearing.

## Set the scene

What's the context? What was true before this post that the reader needs to
know? Link to related work: [#18](https://github.com/schmug/portfolio/pull/18).

## The thing itself

The body of the post. Use `inline code` and:

```ts
// fenced code blocks render with syntax highlighting
const greeting = "hello";
```

Subheaders are fine. Lists are fine:

- Point one
- Point two
- Point three

> Block quotes work too, for callouts or pulled-out reactions.

## What I'd do differently

Optional but a nice closer — what you learned, what you'd change, or what's
next. Avoids a flat ending.

---

*Published as part of [cortech.online](https://cortech.online).*
