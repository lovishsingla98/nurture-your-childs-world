# Nurture Blog Content Pipeline

An automated content pipeline for researching, writing, and publishing SEO-optimized blog posts for the Nurture parenting blog.

---

## What This Pipeline Does

1. **Research** — Identifies high-potential topics using Reddit signals, Google Trends, and competitor gap analysis
2. **Write** — Generates a blog post following strict brand tone, SEO, and structure guidelines
3. **Push** — Uploads the post as a draft to Firestore, ready for review in the admin dashboard

---

## File Map

| File | Purpose |
|------|---------|
| `pipeline.md` | Master context — read at the start of every session |
| `published-topics.md` | Log of all published topics (prevents duplicates) |
| `topic-research-prompt.md` | 5-step research methodology |
| `content-brief-template.md` | Writing rules: structure, tone, SEO, word count |
| `output-template.json` | Blank JSON template for the Firestore document shape |
| `create-post.ts` | TypeScript script to push a draft to Firestore |
| `drafts/` | Generated post JSON files (gitignored) |
| `README.md` | This file |

---

## One-Time Setup

### Dependencies

Already installed. If starting fresh:
```bash
npm install tsx --save-dev
```

No service account needed — the script uses the Nurture client Firebase config (same as all other scripts in this repo).

### Unsplash Cover Images (optional but recommended)

1. Create a free account at [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new app to get an **Access Key**
3. Set the env var:
   ```bash
   export UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
   Add to `~/.zshrc` for persistence.

When set, `create-post.ts` will automatically:
- Search Unsplash using the post's tags
- Download the image and upload it to Firebase Storage
- Set the `coverImage` field on the Firestore document
- Store photographer attribution in `coverImageAttribution`

Without this key, posts are created without a cover image (you can add one manually in the admin UI).

---

## Running a Content Session

Copy-paste this prompt into Claude Code to start a content session:

```
Read these files in order, then follow the instructions:
1. scripts/blog/pipeline.md
2. scripts/blog/published-topics.md
3. scripts/blog/topic-research-prompt.md
4. scripts/blog/content-brief-template.md

Research a new topic using the 5-step methodology, write the blog post,
and save the output JSON to scripts/blog/drafts/{slug}.json.
```

---

## Pushing a Draft to Firestore

After a content session generates a JSON file in `drafts/`:

```bash
npx tsx scripts/blog/create-post.ts scripts/blog/drafts/my-post-slug.json
```

The script will:
- Validate all required fields
- Check that the slug is unique
- Create the post as a **draft** in Firestore
- Print the admin edit URL

Then open the admin URL to:
1. Review the content
2. Add a cover image
3. Publish when ready

---

## After Publishing

Update `published-topics.md` with the new post:

| Title | Target Keyword | Category | Published Date | Slug |
|-------|---------------|----------|---------------|------|
| Your New Post Title | target keyword here | Category | YYYY-MM-DD | your-post-slug |

Commit the change so future sessions see it.

---

## Troubleshooting

**"Slug already exists"**
→ The post slug is taken. Edit the JSON to use a different slug.

**"Validation errors"**
→ Check that title, slug, content, excerpt, and categories are all non-empty in the JSON file.

**TypeScript errors**
→ Run `npx tsx --version` to verify tsx is installed. If not: `npm install tsx --save-dev`
