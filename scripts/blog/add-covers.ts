/**
 * add-covers.ts — Fetch Unsplash cover images for all posts that don't have one
 *
 * Usage:
 *   npx tsx scripts/blog/add-covers.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyBNnvfHAfYMXOEktg9B5DjjDB0LcL5MPrk",
  authDomain: "nurture-466617.firebaseapp.com",
  projectId: "nurture-466617",
  storageBucket: "nurture-466617.firebasestorage.app",
  messagingSenderId: "812235623979",
  appId: "1:812235623979:web:36abf051e42729a3c2e46e",
});

const db = getFirestore(app);

async function fetchCoverImage(
  tags: string[],
  categories: string[],
  title: string
): Promise<{ url: string; attribution: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY not set in .env");
    process.exit(1);
  }

  // Build search query from tags, categories, and title keywords
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2);
  const searchTerms = [
    ...tags.slice(0, 2).map((t) => t.replace(/-/g, " ")),
    ...titleWords,
  ].join(" ");
  const searchQuery = `${searchTerms} child family`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!res.ok) {
      console.log(`    ⚠  Unsplash API error (${res.status})`);
      return null;
    }

    const data = await res.json();
    return {
      url: data.urls.regular,
      attribution: `Photo by ${data.user.name} on Unsplash (${data.user.links.html})`,
    };
  } catch (e) {
    console.log(`    ⚠  Fetch failed: ${(e as Error).message}`);
    return null;
  }
}

async function main() {
  const postsSnap = await getDocs(collection(db, "posts"));
  console.log(`Found ${postsSnap.size} post(s).\n`);

  let updated = 0;

  for (const postDoc of postsSnap.docs) {
    const data = postDoc.data();
    const title = data.title || "(no title)";
    const slug = data.slug || "(no slug)";

    if (data.coverImage) {
      console.log(`  ✓  Already has cover: "${title}"`);
      continue;
    }

    console.log(`  🔍 Fetching cover for: "${title}"`);

    const result = await fetchCoverImage(
      data.tags || [],
      data.categories || [],
      title
    );

    if (result) {
      await updateDoc(doc(db, "posts", postDoc.id), {
        coverImage: result.url,
        coverImageAttribution: result.attribution,
      });
      console.log(`    ✓  Cover added — ${result.attribution}`);
      updated++;
    } else {
      console.log(`    ✗  No image found`);
    }

    // Small delay to respect Unsplash rate limits (50 req/hr on free tier)
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\nDone! Updated ${updated} post(s) with cover images.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
