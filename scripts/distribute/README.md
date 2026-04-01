# Nurture Blog Distribution Pipeline

Automates the distribution of every published blog post across 10+ channels — social media, search engines, Q&A platforms, and structured data. Generates ready-to-post copy for each channel and a pre-filled checklist so nothing gets missed.

---

## File Map

| File | Purpose |
|------|---------|
| `distribution-pipeline.md` | Master context — channel specs, brand voice, format rules |
| `channel-checklist-template.md` | Distribution checklist template (pre-filled per post) |
| `seo-validator.ts` | Validates SEO quality before distribution (score /10) |
| `schema-generator.ts` | Generates Article + FAQ + Speakable JSON-LD schemas |
| `sitemap-generator.ts` | Generates sitemap.xml and robots.txt from published posts |
| `schemas/` | Generated schema HTML files per post |

---

## Prerequisites

- Blog pipeline already set up (`scripts/blog/`)
- `tsx` installed (`npm install tsx --save-dev`)
- Firebase config (uses same client SDK as blog pipeline — no service account)

---

## Run a Distribution Session

Copy-paste this prompt into Claude Code:

```
Read these files in order:
1. scripts/distribute/distribution-pipeline.md
2. scripts/blog/drafts/{slug}.json

Then:
1. Run: npx tsx scripts/distribute/seo-validator.ts scripts/blog/drafts/{slug}.json
2. Generate all channel content (Instagram, Pinterest, WhatsApp, LinkedIn,
   X thread, Reddit, Quora, Facebook, email teaser, schemas)
3. Save everything to scripts/blog/drafts/{slug}-distribution.md
4. Run: npx tsx scripts/distribute/schema-generator.ts scripts/blog/drafts/{slug}.json
5. Run: npx tsx scripts/distribute/sitemap-generator.ts
6. Show me the pre-filled distribution checklist
```

---

## Individual Scripts

### SEO Validator
```bash
npx tsx scripts/distribute/seo-validator.ts scripts/blog/drafts/{slug}.json
```
Checks title length, meta description, slug format, word count, H2 tags, internal links, and more. Outputs a readiness score out of 10.

### Schema Generator
```bash
npx tsx scripts/distribute/schema-generator.ts scripts/blog/drafts/{slug}.json
```
Generates Article, FAQ, and Speakable JSON-LD schemas. Output saved to `scripts/distribute/schemas/{slug}-schema.html`.

### Sitemap Generator
```bash
npx tsx scripts/distribute/sitemap-generator.ts
```
Reads all published posts from Firestore, generates `public/sitemap.xml` and updates `public/robots.txt`. Run after every new post is published.

---

## One-Time Manual Setup

### 1. Pinterest Rich Pins (high priority)
1. Go to https://developers.pinterest.com/tools/url-debugger/
2. Enter your blog URL: `https://enrichbeauty.com/blog`
3. Pinterest will detect the OG tags from your posts
4. Apply for Rich Pins — approval is usually automatic

### 2. Google Search Console (high priority)
1. Go to https://search.google.com/search-console
2. Add property: `https://enrichbeauty.com`
3. Verify via DNS TXT record or HTML file upload
4. Submit sitemap: `https://enrichbeauty.com/sitemap.xml`

### 3. Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add site: `https://enrichbeauty.com`
3. Import from Google Search Console (easiest)
4. Submit sitemap

### 4. Perplexity Publisher Portal
1. Go to https://perplexity.ai/publisher
2. Register your site
3. Submit for publisher verification
4. After approval, new posts are indexed faster for AI search

### 5. Canva Template (for Instagram carousels)
1. Create a Canva template at 1080x1080px
2. Use brand colours: lavender (#8B5CF6) primary, mint (#10B981) accent
3. Font: clean sans-serif (Inter or DM Sans)
4. Layout: centered text, minimal graphics
5. Save as reusable template for all future carousels

---

## Troubleshooting

**SEO validator score < 7**
Fix the hard fails first (they block distribution), then address warnings.

**Schema generator says "no FAQ found"**
Add an H2 "Frequently Asked Questions" section with H3 questions and P answers to the post content.

**Sitemap generator fails**
Check that your Firebase project has published posts (`status: "published"`).
