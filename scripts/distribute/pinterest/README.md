# Pinterest Automation for Nurture Blog

Automatically creates 3 Pinterest pins per blog post with generated images, scheduled over 3 days for optimal reach.

---

## One-Time Setup

### Step 1: Create Pinterest Business Account
1. Go to https://business.pinterest.com
2. Convert or create a business account
3. Claim website: Settings → Claimed accounts → `nurture.org.in` → verify via HTML meta tag

### Step 2: Create a Pinterest App
1. Go to https://developers.pinterest.com
2. Create new app → name it "Nurture Distribution"
3. Set redirect URI to `https://localhost:8085/callback`
4. Note your **App ID** and **App Secret**

### Step 3: Add credentials to .env
```
PINTEREST_APP_ID=your_app_id
PINTEREST_APP_SECRET=your_app_secret
```

### Step 4: Authenticate (get access token)
```bash
npx tsx scripts/distribute/pinterest/auth.ts
```
Opens browser → authorize → token saved to `.pinterest-token.json` (gitignored). Token auto-refreshes when expiring.

### Step 5: Create boards
```bash
npx tsx scripts/distribute/pinterest/setup-boards.ts
```
Creates all 8 boards and saves IDs to `boards.json`.

---

## Run After Every Blog Publish

```bash
npx tsx scripts/distribute/pinterest/create-pins.ts \
  scripts/blog/drafts/{slug}.json \
  scripts/blog/drafts/{slug}-distribution.md
```

This will:
1. Generate 3 pin images (1000x1500px) from the blog cover
2. Create Pin 1 immediately
3. Schedule Pin 2 for tomorrow
4. Schedule Pin 3 for day after tomorrow
5. Log all pins to `pin-log.json`

---

## Files

| File | Purpose |
|------|---------|
| `auth.ts` | OAuth flow + token refresh |
| `setup-boards.ts` | Create boards + save IDs |
| `image-generator.ts` | Generate pin images with Sharp |
| `create-pins.ts` | Main script — creates all 3 pins |
| `boards.json` | Board name → ID mapping |
| `pin-log.json` | Log of all created pins |
| `images/` | Generated pin images (gitignored) |

---

## Why 3 Pins Over 3 Days?

Pinterest rewards consistent daily activity over bulk posting. Posting 3 pins at once to the same URL can trigger spam detection. Spreading them 1 per day:
- Looks organic to Pinterest's algorithm
- Gets 3 separate discovery opportunities
- Each pin targets a different search intent (question, how-to, number)
