# Blog Content Session — Run Prompt

Copy-paste this entire prompt into Claude Code to run a complete content + distribution session.

---

```
Read these files in order, then follow every step:

1. scripts/blog/pipeline.md
2. scripts/blog/published-topics.md
3. scripts/blog/topic-research-prompt.md
4. scripts/blog/content-brief-template.md

STEP 1 — RESEARCH
Follow the 5-step research methodology in topic-research-prompt.md.
Present the top 5 scored topics. Recommend #1 with justification.
Wait for my approval before writing.

STEP 2 — WRITE
Write the blog post following all rules in content-brief-template.md.
Include the FAQ section (4 Q&A pairs) and AEO requirements.
Save the output JSON to scripts/blog/drafts/{slug}.json

STEP 3 — VALIDATE & PUSH
Run: npx tsx scripts/distribute/seo-validator.ts scripts/blog/drafts/{slug}.json
Show the SEO readiness score. If score < 7, fix issues first.
Then run: npx tsx scripts/blog/create-post.ts scripts/blog/drafts/{slug}.json
Show me the admin edit URL.

STEP 4 — COVER IMAGE
The create-post.ts script auto-fetches a cover image from Unsplash.
If the image doesn't fit, I'll replace it in the admin UI.

STEP 5 — SCHEMAS
Run: npx tsx scripts/distribute/schema-generator.ts scripts/blog/drafts/{slug}.json
Show me the generated schemas and where to paste them.

STEP 6 — DISTRIBUTION PACKAGE
Read scripts/distribute/distribution-pipeline.md for channel specs.
Generate ALL of the following and save to scripts/blog/drafts/{slug}-distribution.md:

  6a. Instagram carousel copy (7 slides + caption + hashtags)
  6b. Instagram Story poll question (2 options, drives engagement)
  6c. Pinterest pin copy (3 variations with board assignment)
  6d. WhatsApp broadcast message (4 lines max)
  6e. LinkedIn founder post (180–220 words, remind me link goes in first comment)
  6f. X thread (6 tweets, numbered)
  6g. Reddit comment (150–250 words + 3 search queries)
  6h. Quora answer (250–350 words + 3 search queries)
  6i. Facebook Group post (100–150 words + 3 target groups)
  6j. FAQ schema JSON-LD (4 Q&A pairs)
  6k. Article + Speakable schema JSON-LD
  6l. Email teaser (3 subject lines + preview text + 120-word body)
  6m. Pre-filled distribution checklist with this post's URL and all
      generated copy — every checkbox has the exact text needed

STEP 7 — SITEMAP
Run: npx tsx scripts/distribute/sitemap-generator.ts
Confirm sitemap.xml was updated.

STEP 8 — UPDATE LOG
Add the new post to scripts/blog/published-topics.md
```

---

## Quick version (content only, no distribution)

```
Read these files in order, then follow the instructions:
1. scripts/blog/pipeline.md
2. scripts/blog/published-topics.md
3. scripts/blog/topic-research-prompt.md
4. scripts/blog/content-brief-template.md

Research a new topic, write the blog post, validate SEO,
and push to Firestore. Skip distribution for now.
```
