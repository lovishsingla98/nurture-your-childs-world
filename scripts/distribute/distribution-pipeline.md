# Nurture Blog Distribution Pipeline — Master Context

> **Read this file at the start of every distribution session.**

---

## Brand Context

**Product:** Nurture — AI parenting co-pilot for ages 3–12 by Cortiq Labs
**Website:** nurture.org.in
**Audience:** Parents of children aged 3–12, primarily mothers 28–40, India-first but global
**Brand voice:** Warm, evidence-based, practical, non-judgmental — friend-who-did-the-research tone
**Visual identity:** Lavender primary, mint green accent, clean and airy, no harsh or clinical language

**Social channels:**
- WhatsApp broadcast: [ADD YOUR NUMBER HERE]
- Instagram: [ADD YOUR HANDLE HERE]
- LinkedIn: [ADD YOUR URL HERE]
- Pinterest: [ADD YOUR URL HERE]
- Blog base URL: https://nurture.org.in/blog

---

## Channel Specifications

### Instagram Carousel
- **Slides:** 7–10
- **Slide 1:** Hook — one sentence naming the problem the parent recognises
- **Slides 2–N:** One insight per slide, max 12 words per slide
- **Second-to-last slide:** "What you can try today" — one actionable tip
- **Last slide:** CTA — "Full guide in bio" + handle
- **Tone:** Warm, direct, no jargon
- **Caption:** 3-line hook + 5 relevant hashtags + "link in bio"
- **Hashtag pool:** #parentingtips #childdevelopment #momlife #parentingadvice #raisingkids #gentleparenting #parenthood #kidsandparenting #childbehavior #parentinglife #IndianParenting #momsofindia #parentingindia

### Pinterest (3 pins per post — AUTOMATED)

**Fully automated** via `scripts/distribute/pinterest/create-pins.ts`. Run:
```
npx tsx scripts/distribute/pinterest/create-pins.ts \
  scripts/blog/drafts/{slug}.json \
  scripts/blog/drafts/{slug}-distribution.md
```

What the automation does:
- Generates 3 pin images (1000x1500px) from the blog cover image using Sharp
- Pin 1 published immediately, Pin 2 scheduled +1 day, Pin 3 scheduled +2 days
- Pinterest rewards consistent daily activity — the 3-day spread is intentional strategy
- Board auto-assigned based on post category via `boards.json`
- All pins logged to `pinterest/pin-log.json`

**Pin formats (generated during content session):**
- **Pin 1:** Question format — "Why does my 5-year-old...?"
- **Pin 2:** How-to format — "How to handle..."
- **Pin 3:** Number format — "5 things every parent should know about..."
- **Description:** 80–100 words, keyword in first sentence, ends with "Read the full guide →"

**Board mapping** (configured in `setup-boards.ts`):
  | Category | Board |
  |----------|-------|
  | Child Development | Child Development Ages 3–12 |
  | Sleep | Kids Sleep Tips |
  | Behaviour | Child Behaviour & Discipline |
  | School | School Readiness & Learning |
  | Parenting Strategies | Parenting Tips That Work |
  | Emotional Regulation | Raising Emotionally Healthy Kids |
  | Screen Time | Screen Time & Kids |
  | Parent Wellbeing | Parenting Self-Care |

To add new boards: edit `BOARDS_TO_CREATE` and `CATEGORY_BOARD_MAP` in `setup-boards.ts`, then re-run it.

### WhatsApp Broadcast
- **Max 4 lines**
- Line 1: One sentence hook — name the insight or the surprise
- Line 2: One sentence expanding why it matters to the parent
- Line 3: _(blank — creates breathing room)_
- Line 4: "Read: [full URL]"
- No emojis. No "Dear parents". No exclamation marks.
- Write as if texting a friend, not sending a newsletter.

### LinkedIn Founder Post
- **180–220 words**
- Opens with a counterintuitive or surprising finding from the post
- Never opens with "I" as the first word
- Second paragraph: what the research or data says
- Third paragraph: what this means for parents practically
- Ends with one open question to drive comments
- No hashtags in the body — 3 hashtags at the very end only: #Parenting #ChildDevelopment #Nurture
- **Link goes in the FIRST COMMENT, not the post body** (LinkedIn suppresses reach on posts with external links in body)

### Reddit Comment
- **Subreddits:** r/Parenting, r/Mommit, r/daddit, r/IndianParents, r/Parenting2
- **Format:** Complete, standalone answer to the core question — 150–250 words
- Must be genuinely helpful with or without the link
- Second-to-last line: blank
- Last line: "I wrote a more detailed breakdown here if it's useful: [URL]"
- NEVER lead with the link
- Provide 3 Reddit search queries to find threads to post in

### Quora Answer
- **250–350 words**
- Structure: direct answer (1 para) → explanation (2 paras) → practical advice (1 para) → "Further reading: [URL]"
- Cite one external source (AAP, WHO, or named study)
- Provide 3 Quora search queries to find questions to answer

### Facebook Group Post
- **100–150 words**
- Frame as a discussion starter, not a link share
- Share the most surprising or counterintuitive insight as a question
- Drop the link naturally mid-post or at the end: "Full breakdown here: [URL]"
- Target groups: Indian Parenting Network, Gentle Parenting India, city-specific groups (Mumbai/Delhi/Bangalore Parents)

### X (Twitter) Thread
- **6 tweets**
- Tweet 1: Hook — the problem or surprising finding (under 200 chars)
- Tweets 2–5: One insight per tweet, numbered (2/6, 3/6 etc.)
- Tweet 6: CTA — "Full guide: [URL]" + 2 relevant hashtags
- Each tweet standalone readable — no "cont..." threads

### Google Indexing
- Produce the exact Google Search Console URL Inspection request URL for this post
- Produce the Bing Webmaster URL submission link
- Produce the Perplexity publisher submission reminder

### SEO/AEO Structured Data
- **FAQ schema:** 4 Q&A pairs in valid JSON-LD format based on post content
- **Article schema:** Complete JSON-LD with all fields populated from post metadata
- **Speakable schema:** Marks the intro paragraph as speakable for voice assistants

### Email/Newsletter Teaser (future use)
- **Subject line:** 3 variations (curiosity / direct / number-led)
- **Preview text:** 90 chars max
- **Body:** 120 words max — hook + 3 bullet takeaways + CTA button text + link

---

## Distribution Session Checklist

1. Read this file
2. Read the post JSON from `scripts/blog/drafts/{slug}.json`
3. Run SEO validator: `npx tsx scripts/distribute/seo-validator.ts scripts/blog/drafts/{slug}.json`
4. Generate all channel content and save to `scripts/blog/drafts/{slug}-distribution.md`
5. Run schema generator: `npx tsx scripts/distribute/schema-generator.ts scripts/blog/drafts/{slug}.json`
6. Run sitemap generator: `npx tsx scripts/distribute/sitemap-generator.ts`
7. Execute the distribution checklist in order
