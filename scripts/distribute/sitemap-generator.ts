/**
 * sitemap-generator.ts — Generate sitemap.xml and robots.txt from published posts
 *
 * Usage:
 *   npx tsx scripts/distribute/sitemap-generator.ts
 *
 * Reads all published posts from Firestore, generates:
 *   - public/sitemap.xml
 *   - public/robots.txt
 */

import * as dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const SITE_URL = "https://enrichbeauty.com";

const app = initializeApp({
  apiKey: "AIzaSyBNnvfHAfYMXOEktg9B5DjjDB0LcL5MPrk",
  authDomain: "nurture-466617.firebaseapp.com",
  projectId: "nurture-466617",
  storageBucket: "nurture-466617.firebasestorage.app",
  messagingSenderId: "812235623979",
  appId: "1:812235623979:web:36abf051e42729a3c2e46e",
});

const db = getFirestore(app);

interface PostData {
  slug: string;
  updatedAt?: { toDate: () => Date };
  publishedAt?: { toDate: () => Date };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function main() {
  console.log("  Fetching published posts from Firestore...");

  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("status", "==", "published"));
  const snap = await getDocs(q);

  const posts: PostData[] = snap.docs.map((d) => d.data() as PostData);
  const today = formatDate(new Date());

  // Generate sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `  </url>\n`;

  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/blog</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `  </url>\n`;

  // Published posts
  for (const post of posts) {
    const lastmod = post.updatedAt?.toDate?.()
      ? formatDate(post.updatedAt.toDate())
      : post.publishedAt?.toDate?.()
        ? formatDate(post.publishedAt.toDate())
        : today;

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/blog/${post.slug}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  // Generate robots.txt
  const robots = `User-agent: *\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  // Write files
  const publicDir = path.resolve("public");
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

  console.log(`\n  Sitemap updated — ${posts.length} posts indexed`);
  console.log(`  Output: public/sitemap.xml`);
  console.log(`  Output: public/robots.txt`);
  console.log("");

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
