# Content Brief Template

Follow these rules when writing every blog post. No exceptions.

---

## Word Count

**Target:** 900–1400 words
- Under 900 = too thin for E-E-A-T and ranking
- Over 1400 = loses the reader (our audience is time-poor)

---

## Required HTML Elements

Every post must contain at minimum:

- **3+ `<h2>` sections** — the structural spine of the post
- **1–2 `<h3>` subsections** per `<h2>` where the topic benefits from breakdown
- **1 `<blockquote>`** — a research finding, expert quote, or notable statistic
- **1+ `<ul>` or `<ol>` list** — for actionable steps, signs to watch for, or quick tips
- **`<strong>` and `<em>`** — used sparingly for genuinely important points only, not for decoration

Do NOT include `<h1>` — the post title is rendered separately by the blog template.

---

## AEO (Answer Engine Optimisation) Requirements

Every post must be LLM-ready from the start:

- **Direct answer paragraph:** The first paragraph must contain a 1–2 sentence direct answer to the post's core question. LLMs extract this for citations.
- **FAQ section:** Every post ends with an `<h2>Frequently Asked Questions</h2>` section containing exactly 4 Q&A pairs. Use `<h3>` for questions and `<p>` for answers. Questions must match how parents would actually phrase them.
- **Research citation:** At least one `<blockquote>` citing a specific external source (AAP guidelines, WHO, a named study, or a credentialed expert). Format: "According to [source], [finding]."
- **Speakable intro:** The intro paragraph should be written as a complete, standalone answer that makes sense read aloud — it will be marked with Speakable schema for voice assistants.
- **Define key terms inline:** For any clinical or technical term used, include a brief plain-language definition in parentheses on first use. LLMs extract these definitions.

---

## Section Structure

Follow this structure for every post:

### 1. Hook (1 paragraph)
Start with a specific, relatable scenario the reader will recognise immediately.
- Bad: "In this article, we will explore..."
- Bad: "Parenting is hard. We all know that."
- Good: "Your 6-year-old just slammed their door for the third time today, and you're standing in the hallway wondering if this is normal."

### 2. Why This Matters (1 paragraph)
Validate the reader's concern. Explain what's at stake — developmental context, emotional impact, or practical consequences. This is where you earn the reader's trust.

### 3. Main Content (3–5 `<h2>` sections)
The practical depth of the post. Each section should:
- Address one specific aspect of the topic
- Include concrete, actionable advice (not abstract principles)
- Use age-specific language where possible ("around age 7" not "school-age children")
- Be scannable — short paragraphs (3–4 sentences max), subheadings, lists

### 4. Callout / Blockquote
One `<blockquote>` containing a research reference or expert insight. Format:

```html
<blockquote>
  <p>"Children who experience consistent bedtime routines show better sleep quality and improved daytime behaviour." — Sleep Foundation, 2024</p>
</blockquote>
```

### 5. Practical Takeaway Section (always second-to-last)
A clear, scannable section (often a numbered list) summarising what the reader can do starting today. Title it something like "What You Can Try This Week" or "Quick Wins to Start Today".

### 6. Frequently Asked Questions (always before closing)
An `<h2>Frequently Asked Questions</h2>` section with exactly 4 Q&A pairs:
- Use `<h3>` for each question, `<p>` for the answer
- Phrase questions as parents would actually search them
- Keep answers to 2–3 sentences each
- This section powers the FAQ schema for search engines and AI answers

### 7. Closing Paragraph (final)
Forward-looking and encouraging. No generic summary of what was covered. Instead:
- Acknowledge the reader's effort
- Point toward progress, not perfection
- Optionally hint at a related topic (use `<!-- INTERNAL LINK: [topic] -->`)

---

## Tone Rules

| Rule | Example |
|------|---------|
| Write to one parent, not "parents" | "You might notice your child..." not "Parents often notice..." |
| No guilt language | Never: "you should", "you must", "most parents fail to..." |
| Age-specific where possible | "Around age 5" not "young children" |
| Include one actionable thing | "Tonight, try sitting with your child for 5 minutes before lights out..." |
| Warm but not saccharine | Empathetic, not greeting-card language |
| Acknowledge difficulty | "This is hard" is more powerful than "You've got this!" |

---

## SEO Rules

### Keyword Placement
- **H1 (post title):** Must contain the target keyword naturally
- **First paragraph:** Include the target keyword within the first 2 sentences
- **One `<h2>`:** Include the target keyword or a close variant
- **Meta description:** Include the target keyword

### Keyword Discipline
- **One mention per natural opportunity** — do not force it
- If the keyword doesn't fit naturally in a sentence, rephrase or skip that placement
- Never keyword-stuff

### Internal Linking
Where a cross-link to another Nurture blog post would be natural, add a comment:
```html
<!-- INTERNAL LINK: emotional regulation for 4 year olds -->
```
These will be converted to real links once the target posts exist.

### Post Title Format
Lead with the problem or question, not the solution:
- Good: "Why Does My 4-Year-Old Lie? What's Normal and What to Do"
- Bad: "Teaching Honesty to Young Children: A Complete Guide"
- Good: "Homework Battles with Your 8-Year-Old? Here's What Actually Works"
- Bad: "Effective Homework Strategies for Children"

### Meta Fields
- **metaTitle:** Max 60 characters. Can differ slightly from the post title for SEO.
- **metaDescription:** Max 160 characters. Summarise the value of the post. Include the target keyword.
- **slug:** Lowercase, hyphenated, no special characters. Auto-generated from title.

---

## Output Checklist

Before saving the final JSON, verify:

- [ ] Word count is 900–1400
- [ ] 3+ `<h2>` headings present
- [ ] 1 `<blockquote>` with a source
- [ ] 1+ list (`<ul>` or `<ol>`)
- [ ] No `<h1>` tags in content
- [ ] Opening is a specific scenario, not "In this article..."
- [ ] Target keyword appears in title, first paragraph, one h2, and meta description
- [ ] At least one "try this today" actionable takeaway
- [ ] No guilt language ("you should", "you must")
- [ ] All links have `rel="noopener noreferrer" target="_blank"`
- [ ] Excerpt is under 280 characters
- [ ] metaTitle is under 60 characters
- [ ] metaDescription is under 160 characters
- [ ] Slug matches title, is URL-safe
- [ ] FAQ section present with exactly 4 Q&A pairs (h3 + p)
- [ ] First paragraph contains a direct, standalone answer
- [ ] At least one research citation with named source
- [ ] Technical terms defined inline on first use
- [ ] JSON saved to `scripts/blog/drafts/{slug}.json`
