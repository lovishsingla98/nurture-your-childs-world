# Nurture Blog Content Pipeline — Master Context

> **Read this file at the start of every content session.**
> Then read `published-topics.md` before suggesting any new topics.

---

## Project Context

**Product:** Nurture — an AI parenting co-pilot for children ages 3–12
**Company:** Cortiq Labs
**Website:** nurture.cortiq.labs (new domain, low DA — SEO strategy must account for this)
**Blog purpose:** Drive organic traffic, build topical authority in parenting/child development, and funnel readers toward the Nurture product waitlist.

---

## Target Audience

- **Primary:** Parents of children ages 3–12, primarily mothers aged 28–40
- **Geography:** India (primary), global English-speaking audience (secondary)
- **Mindset:** Time-poor, wants practical advice they can act on today. Searching for answers to specific parenting questions, not browsing for entertainment.
- **Where they search:** Google, Reddit (r/Parenting, r/Mommit), Instagram, WhatsApp parenting groups

---

## Brand Tone Guidelines

| Do | Don't |
|----|-------|
| Warm, like a knowledgeable friend | Clinical or textbook-like |
| Evidence-based — cite research when possible | Make claims without backing |
| Practical — every post has a "try this today" takeaway | Vague or theoretical advice |
| Non-judgmental — meet parents where they are | Preachy, guilt-inducing, "you should" language |
| Age-specific ("around age 5") | Generic ("young children", "kids") |
| Direct — use "you" and "your child" | Abstract third-person ("parents often find...") |

---

## SEO Strategy

- **Domain authority:** New domain, very low DA. We cannot compete on high-KD terms.
- **Keyword difficulty target:** KD < 35 (ideally < 25)
- **Intent focus:** Informational only (how, what, why queries)
- **Preferred keyword shape:** Long-tail, age-specific queries
  - Good: "how to help a 5 year old with separation anxiety"
  - Bad: "parenting tips" (too broad, high KD)
- **Age-specific queries perform well** — always include an age range or specific age when the topic allows
- **Content length sweet spot:** 900–1400 words (enough depth for E-E-A-T, short enough to hold attention)
- **Internal linking:** Use `<!-- INTERNAL LINK: [topic] -->` placeholders where a cross-link would be natural

---

## Content Domains

Cover these topics across the blog, rotating to build topical clusters:

1. **Child development milestones** — cognitive, emotional, social, physical (by age)
2. **Parenting strategies and techniques** — positive discipline, communication, routines
3. **School readiness and academic support** — reading, math concepts, homework habits
4. **Emotional regulation and mental health** — tantrums, anxiety, self-esteem, resilience
5. **Sleep, nutrition, and screen time** — practical guides with age-appropriate advice
6. **Behaviour management** — sharing, lying, aggression, sibling conflict
7. **Parent wellbeing and burnout** — self-care, guilt, managing overwhelm
8. **Age-specific guides** — dedicated content for ages 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

---

## Competitor Reference List

Use these sites to identify content gaps and quality benchmarks:

| Site | Strength | Gap we can exploit |
|------|----------|-------------------|
| Aha Parenting | Deep, empathetic advice | Articles are very long, often 2000+ words — we can be more concise |
| Big Life Journal | Growth mindset, printables | Focuses on mindset only — we cover full spectrum |
| What To Expect | Milestone tracking | Mostly baby/toddler — thin content for ages 5–12 |
| Zero to Three | Research-backed, authoritative | Only covers 0–3 — our age range starts where they stop |
| Understood.org | Learning differences, ADHD | Narrow focus — we cover neurotypical + general parenting |

---

## Output Format Specification

Every content session must produce a JSON file matching `output-template.json`:

```json
{
  "title": "Post Title Here",
  "slug": "post-title-here",
  "excerpt": "Max 280 chars...",
  "content": "<TipTap HTML string>",
  "categories": ["Category"],
  "tags": ["tag-one", "tag-two"],
  "status": "draft",
  "metaTitle": "SEO title (max 60 chars)",
  "metaDescription": "SEO description (max 160 chars)",
  "authorId": "system",
  "coverImage": null,
  "publishedAt": null,
  "scheduledAt": null,
  "commentCount": 0,
  "viewCount": 0
}
```

- The `content` field must be a valid HTML string that TipTap can parse
- Use standard HTML: `<h2>`, `<h3>`, `<p>`, `<strong>`, `<em>`, `<blockquote>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<code>`
- Do not include `<h1>` — the post title is rendered separately
- All links must have `rel="noopener noreferrer" target="_blank"`
- Save the JSON to `scripts/blog/drafts/{slug}.json`

---

## Session Start Checklist

1. Read this file (`pipeline.md`)
2. Read `published-topics.md` — never suggest a topic already listed
3. Read `topic-research-prompt.md` — follow the research steps
4. Read `content-brief-template.md` — follow the writing rules
5. Generate the post and save to `scripts/blog/drafts/{slug}.json`
6. After the post is approved and published, update `published-topics.md`
